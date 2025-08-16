import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import forge from 'node-forge';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! },
});

@Injectable()
export class AssinaturaService {
  constructor(private prisma: PrismaService) {}

  // 1) Solicitar assinatura: retorna hash SHA-256 do PDF (para o provedor assinar)
  async signRequest(documentoId: string, ip?: string, userAgent?: string) {
    const doc = await this.prisma.documentoClinico.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    if (doc.assinaturaStatus === 'ASSINADO') throw new BadRequestException('Documento já assinado');

    const Bucket = process.env.S3_BUCKET!;
    const get = new GetObjectCommand({ Bucket, Key: doc.fileKey });
    const url = await getSignedUrl(s3, get, { expiresIn: 300 });

    // Baixa arquivo na API para calcular hash (MVP simples)
    const resp = await fetch(url);
    if (!resp.ok) throw new BadRequestException('Falha ao obter PDF para hash');
    const buf = Buffer.from(await resp.arrayBuffer());
    const hash = createHash('sha256').update(buf).digest('hex');

    const result = {
      documentoId,
      hashAlgo: 'SHA-256',
      hashHex: hash,                 // o provedor assina este hash
      callbackUrl: (process.env.PUBLIC_BASE_URL || 'http://127.0.0.1:3000') + `/assinatura/${documentoId}/callback`,
    };

    // Auditoria movida para o controller

    return result;
  }

  // 2) Callback de assinatura: recebe assinatura e metadados do certificado
  async signCallback(documentoId: string, body: {
    formato: 'PAdES' | 'CMS',             // provedor te dirá qual formato está entregando
    assinaturaBase64: string,             // se PAdES: PDF assinado (base64); se CMS: .p7s (base64)
    certificadoPem?: string,              // opcional: PEM do certificado do signatário
    cadeiaPem?: string[],                 // opcional: cadeia de certificados
    algoritimo?: string,                  // ex: 'RSA-SHA256'
    signerName?: string,                  // ex: 'Dr. Fulano'
    timestampToken?: string               // opcional: token de carimbo de tempo
  }, ip?: string, userAgent?: string, signature?: string) {
    const doc = await this.prisma.documentoClinico.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    if (doc.assinaturaStatus === 'ASSINADO') throw new BadRequestException('Documento já assinado');

    const Bucket = process.env.S3_BUCKET!;
    const now = new Date();

    // extrair metadados básicos do certificado (se houver)
    let subject: string | null = null;
    let issuer: string | null = null;
    let serial: string | null = null;
    if (body.certificadoPem) {
      try {
        const cert = forge.pki.certificateFromPem(body.certificadoPem);
        subject = cert.subject.attributes.map(a => `${a.shortName}=${a.value}`).join(', ');
        issuer  = cert.issuer.attributes.map(a => `${a.shortName}=${a.value}`).join(', ');
        serial  = cert.serialNumber || null;
      } catch (e) {
        // segue sem metadados se quebrar
      }
    }

    // salva artefato de assinatura no S3
    const bytes = Buffer.from(body.assinaturaBase64, 'base64');
    const signedKey =
      body.formato === 'PAdES'
        ? doc.fileKey.replace(/\.pdf$/i, '.signed.pdf')
        : doc.fileKey.replace(/\.pdf$/i, '.p7s');

    await s3.send(new PutObjectCommand({
      Bucket, Key: signedKey, Body: bytes,
      ContentType: body.formato === 'PAdES' ? 'application/pdf' : 'application/pkcs7-signature',
    }));

    const assinaturaHash = createHash('sha256').update(bytes).digest('hex');

    // atualiza o registro marcando como ASSINADO
    const updated = await this.prisma.documentoClinico.update({
      where: { id: documentoId },
      data: {
        assinaturaStatus: 'ASSINADO',
        signedAt: now,
        signerName: body.signerName ?? doc.signerName ?? null,
        signerCertSubject: subject,
        signerCertIssuer: issuer,
        signerSerial: serial,
        assinaturaAlg: body.algoritimo ?? 'RSA-SHA256',
        assinaturaFormato: body.formato,
        assinaturaKey: signedKey,
        assinaturaHash,
        // validação de certificado
        signerChainPem: body.cadeiaPem ? (body.cadeiaPem as any) : (body.certificadoPem ? [body.certificadoPem] : []),
        certStatus: 'DESCONHECIDO', // será validado pelo job
        certValidadoEm: null,
      },
    });

    // Auditoria movida para o controller

    return { ok: true, documentoId, assinaturaKey: signedKey, assinaturaFormato: body.formato };
  }

  // 3) URL temporária do artefato assinado (para abrir/baixar)
  async signedUrl(documentoId: string) {
    const doc = await this.prisma.documentoClinico.findUnique({ where: { id: documentoId } });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    if (doc.assinaturaStatus !== 'ASSINADO' || !doc.assinaturaKey) throw new BadRequestException('Documento não assinado');

    const Bucket = process.env.S3_BUCKET!;
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: doc.assinaturaKey }), { expiresIn: 300 });
    return { url, expires: 300, formato: doc.assinaturaFormato };
  }
}
