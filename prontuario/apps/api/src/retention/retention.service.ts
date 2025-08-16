import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);
  private readonly RETENTION_YEARS = 20; // Lei 13.787/2018

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  /**
   * Calcula a data de retenção baseada na última atividade do paciente
   */
  calculateRetentionDate(lastActivity: Date): Date {
    const retentionDate = new Date(lastActivity);
    retentionDate.setFullYear(retentionDate.getFullYear() + this.RETENTION_YEARS);
    return retentionDate;
  }

  /**
   * Atualiza a data de retenção de um anexo baseada na última atividade do paciente
   */
  async updateRetentionDate(anexoId: string, patientId: string): Promise<void> {
    try {
      // Buscar última atividade do paciente
      const lastActivity = await this.getLastPatientActivity(patientId);
      
      if (!lastActivity) {
        this.logger.warn(`Nenhuma atividade encontrada para paciente ${patientId}`);
        return;
      }

      const retentionDate = this.calculateRetentionDate(lastActivity);
      const retentionReason = `Lei 13.787/2018 - Retenção obrigatória por ${this.RETENTION_YEARS} anos após último registro`;

      await this.prisma.anexo.update({
        where: { id: anexoId },
        data: {
          retainedUntil: retentionDate,
          lastPatientActivity: lastActivity,
          retentionReason,
        },
      });

      this.logger.log(`Retenção atualizada para anexo ${anexoId} até ${retentionDate.toISOString()}`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar retenção do anexo ${anexoId}:`, error);
      throw error;
    }
  }

  /**
   * Busca a última atividade do paciente no prontuário
   */
  private async getLastPatientActivity(patientId: string): Promise<Date | null> {
    const activities = await Promise.all([
      // Última evolução
      this.prisma.evolucao.findFirst({
        where: { atendimento: { patientId } },
        orderBy: { registradoEm: 'desc' },
        select: { registradoEm: true },
      }),
      // Último atendimento
      this.prisma.atendimento.findFirst({
        where: { patientId },
        orderBy: { startedAt: 'desc' },
        select: { startedAt: true },
      }),
      // Última consulta
      this.prisma.consulta.findFirst({
        where: { pacienteId: patientId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      // Última condição criada/atualizada
      this.prisma.patientCondition.findFirst({
        where: { patientId: patientId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
      // Última medicação criada/atualizada
      this.prisma.patientMedication.findFirst({
        where: { patientId: patientId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const dates = activities
      .map(activity => {
        if (!activity) return null;
        // Verificar cada propriedade de forma segura
        if ('registradoEm' in activity) return activity.registradoEm;
        if ('startedAt' in activity) return activity.startedAt;
        if ('createdAt' in activity) return activity.createdAt;
        if ('updatedAt' in activity) return activity.updatedAt;
        return null;
      })
      .filter(date => date !== null && date !== undefined);

    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d!.getTime()))) : null;
  }

  /**
   * Verifica se um anexo pode ser excluído
   */
  async canDeleteAnexo(anexoId: string): Promise<{ canDelete: boolean; reason?: string; retainedUntil?: Date | null }> {
    const anexo = await this.prisma.anexo.findUnique({
      where: { id: anexoId },
      select: {
        retainedUntil: true,
        legalHold: true,
        deletedAt: true,
        retentionReason: true,
      },
    });

    if (!anexo) {
      return { canDelete: false, reason: 'Anexo não encontrado' };
    }

    if (anexo.legalHold) {
      return { 
        canDelete: false, 
        reason: 'Anexo em legal hold - não pode ser excluído devido a litígio ou auditoria',
        retainedUntil: anexo.retainedUntil,
      };
    }

    if (anexo.deletedAt) {
      return { 
        canDelete: false, 
        reason: 'Anexo já foi marcado como excluído',
        retainedUntil: anexo.retainedUntil,
      };
    }

    const now = new Date();
    if (anexo.retainedUntil && anexo.retainedUntil > now) {
      return { 
        canDelete: false, 
        reason: `Anexo deve ser mantido até ${anexo.retainedUntil.toLocaleDateString('pt-BR')} conforme ${anexo.retentionReason}`,
        retainedUntil: anexo.retainedUntil,
      };
    }

    return { canDelete: true };
  }

  /**
   * Aplica soft delete em um anexo (apenas se permitido)
   */
  async softDeleteAnexo(anexoId: string, deletedBy: string): Promise<{ success: boolean; reason?: string }> {
    const canDelete = await this.canDeleteAnexo(anexoId);
    
    if (!canDelete.canDelete) {
      return { success: false, reason: canDelete.reason };
    }

    await this.prisma.anexo.update({
      where: { id: anexoId },
      data: {
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Soft delete aplicado ao anexo ${anexoId} por ${deletedBy}`);
    return { success: true };
  }

  /**
   * Aplica legal hold em um anexo
   */
  async setLegalHold(anexoId: string, reason: string, setBy: string): Promise<void> {
    await this.prisma.anexo.update({
      where: { id: anexoId },
      data: {
        legalHold: true,
        retentionReason: `${reason} (Legal Hold aplicado por ${setBy} em ${new Date().toLocaleDateString('pt-BR')})`,
      },
    });

    this.logger.log(`Legal hold aplicado ao anexo ${anexoId} por ${setBy}: ${reason}`);
  }

  /**
   * Remove legal hold de um anexo
   */
  async removeLegalHold(anexoId: string, removedBy: string): Promise<void> {
    await this.prisma.anexo.update({
      where: { id: anexoId },
      data: {
        legalHold: false,
        retentionReason: `Lei 13.787/2018 - Retenção obrigatória por ${this.RETENTION_YEARS} anos (Legal Hold removido por ${removedBy} em ${new Date().toLocaleDateString('pt-BR')})`,
      },
    });

    this.logger.log(`Legal hold removido do anexo ${anexoId} por ${removedBy}`);
  }

  /**
   * Lista anexos que podem ser expurgados (após 20 anos e sem legal hold)
   */
  async getExpurgableAnexos(): Promise<any[]> {
    const now = new Date();
    
    return this.prisma.anexo.findMany({
      where: {
        retainedUntil: { lte: now },
        legalHold: false,
        deletedAt: null,
      },
      include: {
        atendimento: {
          include: {
            paciente: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });
  }

  /**
   * Expurga anexos antigos (apenas para administradores)
   */
  async expurgeAnexos(expurgedBy: string): Promise<{ success: boolean; count: number; errors: string[] }> {
    const expurgableAnexos = await this.getExpurgableAnexos();
    const errors: string[] = [];
    let successCount = 0;

    for (const anexo of expurgableAnexos) {
      try {
        // Deletar do storage
        await this.storageService.deleteObject(anexo.storageKey);
        
        // Deletar do banco
        await this.prisma.anexo.delete({
          where: { id: anexo.id },
        });

        successCount++;
        this.logger.log(`Anexo ${anexo.id} expurgado por ${expurgedBy}`);
      } catch (error) {
        const errorMsg = `Erro ao expurgar anexo ${anexo.id}: ${error.message}`;
        errors.push(errorMsg);
        this.logger.error(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      count: successCount,
      errors,
    };
  }
}
