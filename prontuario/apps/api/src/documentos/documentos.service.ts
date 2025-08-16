import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID, createHash } from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});

type ReceitaItem = { medicamento: string; posologia: string; quantidade?: string };

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async receita(payload: {
    pacienteId: string;
    evolucaoId?: string;
    itens: ReceitaItem[];
    observacoes?: string;
    assinaturaImagemBase64?: string; // PNG/JPG base64 opcional (MVP)
  }) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id: payload.pacienteId } });
    if (!paciente) throw new NotFoundException('Paciente não encontrado');

    // Monta PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4 em pt
    const { width } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size=11, bold=false) => {
      page.drawText(text, { x, y, size, font: bold ? fontBold : font, color: rgb(0,0,0) });
    };

    // Header (timbre textual simples)
    const medico = process.env.MEDICO_NOME || 'Médico(a)';
    const crm = process.env.MEDICO_CRM || 'CRM';
    const esp = process.env.MEDICO_ESPECIALIDADE || '';
    const clin = process.env.CLINICA_NOME || '';
    const end  = process.env.CLINICA_ENDERECO || '';

    let y = 800;
    drawText(clin, 40, y, 14, true); y -= 16;
    if (end) { drawText(end, 40, y); y -= 14; }
    drawText(`${medico} — ${esp}`, 40, y, 12, true); y -= 14;
    drawText(crm, 40, y); y -= 24;

    page.drawLine({ start: { x: 40, y }, end: { x: width-40, y }, thickness: 1, color: rgb(0,0,0) });
    y -= 24;

    // Título
    drawText('RECEITUÁRIO MÉDICO', 40, y, 14, true);
    y -= 28;

    // Paciente / Data
    const dataStr = new Date().toLocaleDateString('pt-BR');
    drawText(`Paciente: ${paciente.nome}`, 40, y, 12, true); y -= 16;
    if (paciente.dtNasc) { drawText(`Nascimento: ${new Date(paciente.dtNasc).toLocaleDateString('pt-BR')}`, 40, y); y -= 14; }
    drawText(`Data: ${dataStr}`, 40, y); y -= 22;

    // Itens
    drawText('Prescrições:', 40, y, 12, true); y -= 18;
    for (const [i, it] of payload.itens.entries()) {
      drawText(`${i+1}. ${it.medicamento}`, 48, y, 11, true); y -= 14;
      drawText(`   Posologia: ${it.posologia}`, 48, y, 11); y -= 14;
      if (it.quantidade) { drawText(`   Quantidade: ${it.quantidade}`, 48, y, 11); y -= 14; }
      y -= 6;
      if (y < 120) { // nova página se precisar
        page.drawText('Continua...', { x: width-120, y: 50, size: 10, font });
        y = 780;
      }
    }

    if (payload.observacoes) {
      y -= 6;
      drawText('Observações:', 40, y, 12, true); y -= 14;
      drawText(payload.observacoes, 48, y); y -= 20;
    }

    // QR de verificação
    const verifyUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/documentos/verify`;
    const qrPng = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 100 });
    const qrBytes = Buffer.from(qrPng.split(',')[1], 'base64');
    const qrImg = await pdf.embedPng(qrBytes);
    page.drawImage(qrImg, { x: width-140, y: 80, width: 100, height: 100 });

    // Assinatura (imagem opcional do MVP)
    drawText('Assinatura do médico:', 40, 130, 11);
    page.drawLine({ start: { x: 40, y: 120 }, end: { x: 280, y: 120 }, thickness: 1, color: rgb(0,0,0) });

    if (payload.assinaturaImagemBase64) {
      const b64 = payload.assinaturaImagemBase64;
      const isPng = b64.startsWith('data:image/png');
      const bytes = Buffer.from(b64.split(',')[1] ?? b64, 'base64');
      const sigImg = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      page.drawImage(sigImg, { x: 42, y: 125, width: 180, height: 50 });
    }

    // Rodapé
    drawText(`${medico} — ${crm}`, 40, 90, 11);
    drawText(new Date().toLocaleString('pt-BR'), 40, 70, 10);

    // Polimento do PDF: Watermark + Logo + Hash
    // 1) Watermark "NÃO ASSINADO" em todas as páginas
    for (const pg of pdf.getPages()) {
      pg.drawText('NÃO ASSINADO', {
        x: 100, y: 400, size: 48, 
        color: rgb(0.8, 0.8, 0.8), 
        opacity: 0.25,
      });
    }

    // 2) Logo (se configurado)
    const logoB64 = process.env.LOGO_BASE64;
    if (logoB64) {
      try {
        const bytes = Buffer.from(logoB64.split(',').pop() || logoB64, 'base64');
        const isPng = logoB64.includes('png') || logoB64.includes('image/png');
        const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const first = pdf.getPages()[0];
        first.drawImage(img, { x: 40, y: 810, width: 120, height: 40 });
      } catch (e) {
        console.warn('Falha ao carregar logo:', e);
      }
    }

    // 3) Hash no rodapé (placeholder - será calculado após save)
    for (const pg of pdf.getPages()) {
      pg.drawText('Hash: será calculado após upload', { x: 40, y: 50, size: 9 });
    }

    const pdfBytes = await pdf.save();
    const sha = createHash('sha256').update(pdfBytes).digest('hex');

    // Upload S3
    const key = `docs/${new Date().getFullYear()}/${String(new Date().getMonth()+1).padStart(2,'0')}/${randomUUID()}.pdf`;
    const Bucket = process.env.S3_BUCKET!;
    await s3.send(new PutObjectCommand({
      Bucket, Key: key, Body: Buffer.from(pdfBytes), ContentType: 'application/pdf', ContentLength: pdfBytes.length
    }));

    const doc = await this.prisma.documentoClinico.create({
      data: {
        tipo: 'RECEITA',
        pacienteId: payload.pacienteId,
        fileKey: key,
        urlPublica: null, // mantenha privado; baixe via presign GET
        hashSha256: sha,
        tamanhoBytes: pdfBytes.length,
        assinaturaStatus: payload.assinaturaImagemBase64 ? 'ASSINADO' : 'NAO_ASSINADO', // imagem é "assinatura visual", não PKI
        signerName: process.env.MEDICO_NOME || null,
        payloadJson: payload as any,
      } as any,
      include: { paciente: true },
    });

    return { ...doc, presignedUrl: null /* vamos expor por endpoint GET seguro */ };
  }

  // Presign GET separado (segurança/controle)
  async presignGet(documentoId: string) {
    const doc = await this.prisma.documentoClinico.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    const Bucket = process.env.S3_BUCKET!;
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: doc.fileKey }), { expiresIn: 300 });
    return { url, expires: 300 };
  }
}
