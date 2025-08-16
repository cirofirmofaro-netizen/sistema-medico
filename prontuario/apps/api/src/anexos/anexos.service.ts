import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { RetentionService } from '../retention/retention.service';
import { s3Client, bucketConfig } from '../storage/s3.client';
import { env } from '../config/env';
import { CommitTempDto } from './dto/upload-review.dto';

@Injectable()
export class AnexosService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private retentionService: RetentionService,
  ) {}

  private ensureAllowed(mime: string, size: number) {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!allowedMimeTypes.includes(mime)) {
      throw new BadRequestException(`Tipo de arquivo não permitido (${mime}). Permitidos: ${allowedMimeTypes.join(', ')}`);
    }
    
    const maxBytes = 50 * 1024 * 1024; // 50MB
    if (size <= 0 || size > maxBytes) {
      throw new BadRequestException(`Tamanho inválido (max ${Math.floor(maxBytes/1024/1024)}MB).`);
    }
  }

  /**
   * Confirma upload temporário e move para definitivo
   */
  async commitTemp(data: CommitTempDto) {
    const { keyTemp, pacienteId, tipo, observacao, contentType, filename, size } = data;

    // Verificar se o arquivo temporário existe
    const tempExists = await this.storageService.objectExists(keyTemp, env.UPLOAD_TEMP_BUCKET);
    if (!tempExists) {
      throw new NotFoundException('Arquivo temporário não encontrado');
    }

    // Validar arquivo
    this.ensureAllowed(contentType, size);

    // Verificar se o paciente existe
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: pacienteId }
    });
    if (!paciente) {
      throw new BadRequestException('Paciente não encontrado');
    }

    // Gerar chave definitiva
    const keyFinal = this.storageService['generateStorageKey'](filename, 'anexos');

    // Copiar do temporário para definitivo
    await this.storageService.copyFromTempToFinal({
      sourceKey: keyTemp,
      destinationKey: keyFinal,
      contentType,
      sourceBucket: env.UPLOAD_TEMP_BUCKET,
      destinationBucket: env.S3_BUCKET,
    });

    // Criar registro no banco
    const anexo = await this.prisma.anexo.create({
      data: {
        filename,
        mimeType: contentType,
        size,
        storageKey: keyFinal,
        titulo: tipo,
        tipoDocumento: observacao,
        atendimento: {
          connect: {
            // Conectar ao último atendimento do paciente ou criar um novo
            id: await this.getOrCreateAtendimento(pacienteId),
          },
        },
      } as any,
      include: { atendimento: { include: { paciente: true } } }
    });

    // Atualizar data de retenção
    await this.retentionService.updateRetentionDate(anexo.id, pacienteId);

    // Deletar arquivo temporário
    await this.storageService.deleteTemp(keyTemp);

    // Gerar URL de download definitiva
    const downloadUrl = await this.storageService.getPresignedGetUrl({ key: keyFinal });

    return {
      keyFinal,
      urlGet: downloadUrl.url,
      anexoId: anexo.id,
      success: true,
    };
  }

  /**
   * Obtém ou cria um atendimento para o paciente
   */
  private async getOrCreateAtendimento(pacienteId: string): Promise<string> {
    // Buscar último atendimento em andamento
    const atendimentoAtivo = await this.prisma.atendimento.findFirst({
      where: {
        patientId: pacienteId,
        status: 'EM_ANDAMENTO',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (atendimentoAtivo) {
      return atendimentoAtivo.id;
    }

    // Criar novo atendimento
    const novoAtendimento = await this.prisma.atendimento.create({
      data: {
        patientId: pacienteId,
        professionalId: await this.getFirstUserId(),
        serviceDate: new Date(),
        status: 'EM_ANDAMENTO',
      } as any,
    });

    return novoAtendimento.id;
  }

  /**
   * Obtém o primeiro usuário disponível
   */
  private async getFirstUserId(): Promise<string> {
    const usuario = await this.prisma.usuario.findFirst({
      select: { id: true },
    });
    
    if (!usuario) {
      throw new BadRequestException('Nenhum usuário encontrado no sistema');
    }
    
    return usuario.id;
  }

  async presign(atendimentoId: string, filename: string, mimeType: string, size: number) {
    console.log('Presign request:', { atendimentoId, filename, mimeType, size })
    
    const atendimento = await this.prisma.atendimento.findUnique({ where: { id: atendimentoId } });
    if (!atendimento) throw new NotFoundException('Atendimento não encontrado');

    this.ensureAllowed(mimeType, size);

    // Usar o StorageService injetado
    return this.storageService.getPresignedPutUrl({
      filename,
      contentType: mimeType,
      size,
    });
  }

  async finalize(atendimentoId: string, payload: {
    filename: string; mimeType: string; size: number; storageKey: string; urlPublica?: string; titulo?: string; tipoDocumento?: string;
  }) {
    const atendimento = await this.prisma.atendimento.findUnique({ 
      where: { id: atendimentoId },
      include: { paciente: true }
    });
    if (!atendimento) throw new NotFoundException('Atendimento não encontrado');
    this.ensureAllowed(payload.mimeType, payload.size);

    // Criar o anexo
    const anexo = await this.prisma.anexo.create({ 
      data: { atendimentoId, ...payload } as any,
      include: { atendimento: { include: { paciente: true } } }
    });

    // Atualizar data de retenção baseada na última atividade do paciente
    if (atendimento.paciente) {
      await this.retentionService.updateRetentionDate(anexo.id, atendimento.paciente.id);
    }

    return anexo;
  }

  listByAtendimento(atendimentoId: string) {
    return this.prisma.anexo.findMany({ 
      where: { 
        atendimentoId,
        deletedAt: null // Não mostrar anexos com soft delete
      }, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  async presignDownload(anexoId: string) {
    const a = await this.prisma.anexo.findUnique({ 
      where: { id: anexoId },
      include: { atendimento: { include: { paciente: true } } }
    });
    if (!a) throw new NotFoundException('Anexo não encontrado');
    
    // Verificar se o anexo foi soft deleted
    if (a.deletedAt) {
      throw new NotFoundException('Anexo não está mais disponível');
    }
    
    // Usar o StorageService injetado
    return this.storageService.getPresignedGetUrl({ key: a.storageKey });
  }

  async get(anexoId: string) {
    const anexo = await this.prisma.anexo.findUnique({ 
      where: { id: anexoId },
      include: { atendimento: { include: { paciente: true } } }
    });
    if (!anexo) throw new NotFoundException('Anexo não encontrado');
    return anexo;
  }

  async delete(anexoId: string) {
    const anexo = await this.prisma.anexo.findUnique({ 
      where: { id: anexoId },
      include: { atendimento: { include: { paciente: true } } }
    });
    if (!anexo) throw new NotFoundException('Anexo não encontrado');

    // Verificar se pode ser excluído conforme política de retenção
    const canDelete = await this.retentionService.canDeleteAnexo(anexoId);
    if (!canDelete.canDelete) {
      throw new BadRequestException(canDelete.reason);
    }

    // Usar o StorageService injetado
    await this.storageService.deleteObject(anexo.storageKey);

    // Deletar do banco
    await this.prisma.anexo.delete({ where: { id: anexoId } });

    return { success: true };
  }
}
