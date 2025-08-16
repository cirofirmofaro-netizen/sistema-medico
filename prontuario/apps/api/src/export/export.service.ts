import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import archiver from 'archiver';
import { PassThrough } from 'stream';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});

type ExportOpts = {
  pacienteId: string;
  from?: string; // ISO
  to?: string;   // ISO
  incluirAnexos?: boolean; // default false
};

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  private rangeFilter(from?: string, to?: string) {
    if (!from && !to) return undefined;
    const f: any = {};
    if (from) f.gte = new Date(from);
    if (to)   f.lte = new Date(to);
    return f;
  }

  async exportProntuario(opts: { pacienteId: string; from?: string; to?: string; incluirAnexos?: boolean }) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id: opts.pacienteId } });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');

    // carrega atendimentos + evoluções + anexos, filtrando por período pela data do atendimento
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { 
        patientId: opts.pacienteId, 
        serviceDate: this.rangeFilter(opts.from, opts.to) 
      },
      orderBy: { serviceDate: 'desc' },
      include: {
        evolucoes: {
          orderBy: { registradoEm: 'asc' },
          include: { 
            autor: true 
          },
        },
        sinaisVitais: {
          orderBy: { registradoEm: 'asc' }
        },
        anexos: {
          orderBy: { createdAt: 'asc' }
        },
        profissional: true
      },
    });

    // Monta PDF
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const page = () => pdf.addPage([595.28, 841.89]); // A4
    let p = page();
    let y = 800;
    const line = (txt: string, size = 11, b = false) => {
      p.drawText(txt, { x: 40, y, size, font: b ? bold : font, color: rgb(0,0,0) });
      y -= size + 4;
      if (y < 80) { p = page(); y = 800; }
    };
    const hline = () => { p.drawLine({ start: {x:40,y}, end:{x:555,y}, thickness:1, color: rgb(0,0,0)}); y-=10; };

    // Cabeçalho
    const periodo = `${opts.from ? new Date(opts.from).toLocaleDateString('pt-BR'): 'início'} → ${opts.to ? new Date(opts.to).toLocaleDateString('pt-BR') : 'hoje'}`;
    line(`Prontuário – ${paciente.nome}`, 16, true);
    line(`Período: ${periodo}`, 12);
    if (paciente.dtNasc) line(`Nascimento: ${new Date(paciente.dtNasc).toLocaleDateString('pt-BR')}`);
    hline();

    // Sumário
    let totalEvos = 0, totalAnexos = 0, totalVitals = 0;
    atendimentos.forEach(a => {
      totalEvos += a.evolucoes.length;
      totalAnexos += a.anexos.length;
      totalVitals += a.sinaisVitais.length;
    });
    line(`Atendimentos: ${atendimentos.length} • Evoluções: ${totalEvos} • Sinais Vitais: ${totalVitals} • Anexos: ${totalAnexos}`, 12);
    y -= 6;

    // Conteúdo
    for (const atendimento of atendimentos) {
      hline();
      line(`Atendimento: ${new Date(atendimento.serviceDate).toLocaleDateString('pt-BR')} • Status: ${atendimento.status}`, 12, true);
      if (atendimento.profissional) {
        line(`Profissional: ${atendimento.profissional.nome}`, 11);
      }
      y -= 4;
      
      // Evoluções
      for (const ev of atendimento.evolucoes) {
        line(`– Evolução em ${new Date(ev.registradoEm).toLocaleString('pt-BR')}`, 11, true);
        if (ev.resumo) line(`Resumo: ${ev.resumo}`);
        // texto (quebra simples)
        const text = ev.texto || '';
        const chunks = text.split('\n');
        for (const c of chunks) line(c);
        y -= 6;
      }

      // Sinais Vitais
      for (const sv of atendimento.sinaisVitais) {
        line(`– Sinais Vitais em ${new Date(sv.registradoEm).toLocaleString('pt-BR')}`, 11, true);
        line(`PA: ${sv.pressaoSistolica}/${sv.pressaoDiastolica} • FC: ${sv.frequenciaCardiaca} • FR: ${sv.frequenciaRespiratoria}`);
        if (sv.temperatura) line(`Temperatura: ${sv.temperatura}°C`);
        if (sv.saturacaoOxigenio) line(`Saturação: ${sv.saturacaoOxigenio}%`);
        if (sv.peso) line(`Peso: ${sv.peso}kg`);
        if (sv.altura) line(`Altura: ${sv.altura}cm`);
        y -= 6;
      }

      // Anexos
      if (atendimento.anexos.length) {
        line(`Anexos (${atendimento.anexos.length}):`, 11, true);
        for (const a of atendimento.anexos) {
          line(`• ${a.filename} (${a.mimeType}, ${Math.round(a.size/1024)} KB)`);
        }
        y -= 6;
      }
    }

    // Upload do PDF
    const pdfBytes = await pdf.save();
    const key = `exports/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${randomUUID()}.pdf`;
    const Bucket = process.env.S3_BUCKET!;
    await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: Buffer.from(pdfBytes), ContentType: 'application/pdf' }));

    // Se não incluir anexos, retorna só o PDF
    if (!opts.incluirAnexos) {
      const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 300 });
      return { tipo: 'PDF', fileKey: key, url, expires: 300 };
    }

    // ZIP real com arquivos binários (stream S3→ZIP)
    const listKey = `exports/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${randomUUID()}.zip`;
    const pass = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    const uploadPromise = s3.send(new PutObjectCommand({ Bucket, Key: listKey, Body: pass, ContentType: 'application/zip' }));
    archive.on('error', err => { throw err; });
    archive.pipe(pass);

    // adiciona o PDF principal
    archive.append(Buffer.from(pdfBytes), { name: 'prontuario.pdf' });

    // adiciona anexos binários (stream do S3)
    for (const atendimento of atendimentos) {
      for (const a of atendimento.anexos) {
        try {
          const getCmd = new GetObjectCommand({ Bucket, Key: a.storageKey });
          const obj: any = await s3.send(getCmd);
          // obj.Body é Readable
          const safeName = `anexos/${a.id}_${a.filename}`.replace(/[^\w.\-\/]/g, '_');
          archive.append(obj.Body, { name: safeName });
        } catch (e) {
          console.warn(`Falha ao incluir anexo ${a.filename}:`, e);
        }
      }
    }

    await archive.finalize();
    await uploadPromise;
    const urlZip = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: listKey }), { expiresIn: 300 });
    return { tipo: 'ZIP', fileKey: listKey, url: urlZip, expires: 300 };
  }
}
