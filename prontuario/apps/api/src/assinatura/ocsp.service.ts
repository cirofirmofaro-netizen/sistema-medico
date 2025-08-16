import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import forge from 'node-forge';
import * as ocsp from 'ocsp';

type Der = Buffer;

@Injectable()
export class OcspService {
  private readonly logger = new Logger(OcspService.name);
  constructor(private prisma: PrismaService) {}

  // Util: PEM -> DER
  private pemToDer(pem: string): Der {
    const b64 = pem.replace(/-----(BEGIN|END) CERTIFICATE-----/g, '').replace(/\s+/g, '');
    return Buffer.from(b64, 'base64');
  }

  // Tenta descobrir URI do OCSP a partir do certificado (AIA)
  private getOcspUriFromPem(pem: string): string | null {
    try {
      const cert = forge.pki.certificateFromPem(pem);
      const exts = cert.extensions || [];
      const aia: any = exts.find((e: any) => e.name === 'authorityInfoAccess');
      if (aia?.accessDescriptions) {
        const ocspInfo = aia.accessDescriptions.find((d: any) => d.accessMethod === forge.pki.oids.ocsp);
        return ocspInfo?.accessLocation?.value || null;
      }
    } catch {}
    return null;
  }

  // Checa OCSP (best effort). Se falhar, retorna null.
  private async checkOcsp(leafPem: string, issuerPem?: string | null): Promise<'VALIDO'|'REVOGADO'|'DESCONHECIDO'|null> {
    try {
      const uri = this.getOcspUriFromPem(leafPem);
      if (!uri) return null;

      const leafDer = this.pemToDer(leafPem);
      let issuerDer: Der | undefined;
      if (issuerPem) issuerDer = this.pemToDer(issuerPem);

      // se não veio issuer, tentamos sem (alguns responders aceitam chaining)
      const req = ocsp.request.generate(leafDer, issuerDer);
      const options = { url: uri, ocsp: req.data };
      const res: any = await new Promise((resolve, reject) =>
        ocsp.utils.getResponse(options, (err: any, r: any) => (err ? reject(err) : resolve(r))),
      );

      const status = ocsp.utils.verifyResponse({ request: req, response: res });
      // status.type: 'good' | 'revoked' | 'unknown'
      if (status.type === 'good') return 'VALIDO';
      if (status.type === 'revoked') return 'REVOGADO';
      return 'DESCONHECIDO';
    } catch (e) {
      this.logger.warn(`OCSP falhou: ${String(e)}`);
      return null;
    }
  }

  // Estratégia: tentamos OCSP do leaf; se não der, tentamos OCSP do intermediário; se nada, marcamos DESCONHECIDO.
  async validateOne(documentoId: string) {
    const doc = await this.prisma.documentoClinico.findUnique({ where: { id: documentoId } });
    if (!doc || doc.assinaturaStatus !== 'ASSINADO') return;

    const chain: string[] = (doc.signerChainPem as any) || [];
    const leaf = chain[0] || null;
    const issuer = chain[1] || null;

    let result: any = null;
    if (leaf) result = await this.checkOcsp(leaf, issuer);

    // fallback: tentar OCSP no intermediário, se existir
    if (!result && issuer) result = await this.checkOcsp(issuer, null);

    const certStatus = (result ?? 'DESCONHECIDO') as any;
    await this.prisma.documentoClinico.update({
      where: { id: documentoId },
      data: { certStatus, certValidadoEm: new Date() },
    });
    return certStatus;
  }

  // roda a cada 12h; valida docs assinados sem certValidadoEm ou validados há >7 dias
  @Cron(CronExpression.EVERY_12_HOURS)
  async periodicValidation() {
    this.logger.log('Iniciando validação periódica de certificados...');
    
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendentes = await this.prisma.documentoClinico.findMany({
      where: {
        assinaturaStatus: 'ASSINADO',
        OR: [{ certValidadoEm: null }, { certValidadoEm: { lt: cutoff } }],
      },
      select: { id: true },
      take: 50, // limita por execução
    });

    this.logger.log(`Encontrados ${pendentes.length} documentos para validar`);

    for (const d of pendentes) {
      try {
        const status = await this.validateOne(d.id);
        this.logger.debug(`Documento ${d.id}: ${status}`);
      } catch (e) {
        this.logger.error(`Falha validando ${d.id}: ${String(e)}`);
      }
    }

    this.logger.log('Validação periódica concluída');
  }

  // Método público para validação manual
  async validateDocument(documentoId: string) {
    return this.validateOne(documentoId);
  }
}
