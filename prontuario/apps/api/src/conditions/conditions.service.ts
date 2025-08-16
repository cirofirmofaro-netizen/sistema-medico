import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { canonicalize } from '../common/canonicalize';

@Injectable()
export class ConditionsService {
  constructor(private prisma: PrismaService) {}

  async searchConditions(query: string) {
    const canonicalQuery = canonicalize(query);
    
    const conditions = await this.prisma.condition.findMany({
      where: {
        OR: [
          { canonical: { contains: canonicalQuery } },
          { icd10: { contains: query, mode: 'insensitive' } },
          {
            synonyms: {
              some: {
                canonical: { contains: canonicalQuery }
              }
            }
          }
        ]
      },
      include: {
        synonyms: true
      },
      take: 20,
      orderBy: {
        name: 'asc'
      }
    });

    return conditions.map(condition => ({
      id: condition.id,
      name: condition.name,
      icd10: condition.icd10,
      flags: {
        chronicDefault: condition.chronicDefault,
        treatableDefault: condition.treatableDefault,
        allowRecurrence: condition.allowRecurrence,
        typicalDurationDays: condition.typicalDurationDays
      },
      synonyms: condition.synonyms.map(s => s.value)
    }));
  }

  async getPatientConditions(patientId: string) {
    const patientConditions = await this.prisma.patientCondition.findMany({
      where: { patientId },
      include: {
        condition: {
          include: {
            synonyms: true
          }
        },
        occurrences: {
          orderBy: { startAt: 'desc' }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return patientConditions.map(pc => {
      const isChronic = pc.chronicOverride ?? pc.condition.chronicDefault;
      const isTreatable = pc.treatableOverride ?? pc.condition.treatableDefault;

      return {
        id: pc.id,
        conditionId: pc.conditionId,
        condition: {
          id: pc.condition.id,
          name: pc.condition.name,
          icd10: pc.condition.icd10,
          flags: {
            chronicDefault: pc.condition.chronicDefault,
            treatableDefault: pc.condition.treatableDefault,
            allowRecurrence: pc.condition.allowRecurrence,
            typicalDurationDays: pc.condition.typicalDurationDays
          },
          synonyms: pc.condition.synonyms.map(s => s.value)
        },
        source: pc.source,
        status: pc.status,
        onsetDate: pc.onsetDate,
        resolutionDate: pc.resolutionDate,
        chronicOverride: pc.chronicOverride,
        treatableOverride: pc.treatableOverride,
        severity: pc.severity,
        notes: pc.notes,
        appointmentId: pc.appointmentId,
        lastReviewedAt: pc.lastReviewedAt,
        locked: pc.locked,
        isChronic,
        isTreatable,
        occurrences: pc.occurrences,
        createdAt: pc.createdAt,
        updatedAt: pc.updatedAt
      };
    });
  }

  async createPatientCondition(patientId: string, data: any) {
    try {
      console.log('Criando condição do paciente:', { patientId, data });
      
      const createData: any = {
        patientId,
        conditionId: data.conditionId,
        source: data.source,
        status: data.status || 'ACTIVE',
        onsetDate: data.onsetDate ? new Date(data.onsetDate + 'T00:00:00') : null,
        resolutionDate: data.resolutionDate ? new Date(data.resolutionDate + 'T00:00:00') : null,
        chronicOverride: data.chronicOverride,
        treatableOverride: data.treatableOverride,
        severity: data.severity,
        notes: data.notes,
        lastReviewedAt: new Date()
      };

      // Só incluir appointmentId se não for undefined
      if (data.appointmentId) {
        createData.appointmentId = data.appointmentId;
      }
      
      const patientCondition = await this.prisma.patientCondition.create({
        data: createData,
        include: {
          condition: {
            include: {
              synonyms: true
            }
          },
          occurrences: true
        }
      });

      console.log('Condição criada com sucesso:', patientCondition.id);

      const isChronic = patientCondition.chronicOverride ?? patientCondition.condition.chronicDefault;
      const isTreatable = patientCondition.treatableOverride ?? patientCondition.condition.treatableDefault;

      return {
        id: patientCondition.id,
        conditionId: patientCondition.conditionId,
        condition: {
          id: patientCondition.condition.id,
          name: patientCondition.condition.name,
          icd10: patientCondition.condition.icd10,
          flags: {
            chronicDefault: patientCondition.condition.chronicDefault,
            treatableDefault: patientCondition.condition.treatableDefault,
            allowRecurrence: patientCondition.condition.allowRecurrence,
            typicalDurationDays: patientCondition.condition.typicalDurationDays
          },
          synonyms: patientCondition.condition.synonyms.map(s => s.value)
        },
        source: patientCondition.source,
        status: patientCondition.status,
        onsetDate: patientCondition.onsetDate,
        resolutionDate: patientCondition.resolutionDate,
        chronicOverride: patientCondition.chronicOverride,
        treatableOverride: patientCondition.treatableOverride,
        severity: patientCondition.severity,
        notes: patientCondition.notes,
        appointmentId: patientCondition.appointmentId,
        lastReviewedAt: patientCondition.lastReviewedAt,
        locked: patientCondition.locked,
        isChronic,
        isTreatable,
        occurrences: patientCondition.occurrences,
        createdAt: patientCondition.createdAt,
        updatedAt: patientCondition.updatedAt
      };
    } catch (error) {
      console.error('Erro ao criar condição do paciente:', error);
      console.error('Dados que causaram o erro:', { patientId, data });
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  async updatePatientCondition(patientId: string, pcId: string, data: any) {
    try {
      console.log('Atualizando condição do paciente:', { patientId, pcId, data });
      
      // Buscar a condição atual
      const currentCondition = await this.prisma.patientCondition.findUnique({
        where: { 
          id: pcId,
          patientId // Garantir que pertence ao paciente
        },
        include: {
          condition: {
            include: {
              synonyms: true
            }
          },
          occurrences: {
            orderBy: { startAt: 'desc' }
          }
        }
      });

      if (!currentCondition) {
        throw new Error('Condição não encontrada');
      }

      // Verificar se a condição foi criada em um atendimento finalizado
      if (currentCondition.appointmentId) {
        const appointment = await this.prisma.atendimento.findUnique({
          where: { id: currentCondition.appointmentId }
        });

        if (appointment && appointment.status === 'FINALIZADO') {
          console.log('Atendimento finalizado detectado. Verificando permissões...');
          
          // Se está tentando marcar como resolvida, permitir e encerrar episódio atual
          if (data.status === 'RESOLVED' && currentCondition.status === 'ACTIVE') {
            console.log('Permitindo marcar como resolvida em atendimento finalizado');
            
            // Buscar o episódio atual (mais recente sem data de fim)
            const currentOccurrence = await this.prisma.conditionOccurrence.findFirst({
              where: {
                patientConditionId: pcId,
                endAt: null
              },
              orderBy: { startAt: 'desc' }
            });

            // Se há um episódio ativo, encerrá-lo
            if (currentOccurrence) {
              await this.prisma.conditionOccurrence.update({
                where: { id: currentOccurrence.id },
                data: { 
                  endAt: data.resolutionDate ? new Date(data.resolutionDate) : new Date()
                }
              });
            }

            const patientCondition = await this.prisma.patientCondition.update({
              where: { 
                id: pcId,
                patientId
              },
              data: {
                status: data.status,
                resolutionDate: data.resolutionDate ? new Date(data.resolutionDate) : new Date(),
                lastReviewedAt: new Date()
              },
              include: {
                condition: {
                  include: {
                    synonyms: true
                  }
                },
                occurrences: {
                  orderBy: { startAt: 'desc' }
                }
              }
            });

            const isChronic = patientCondition.chronicOverride ?? patientCondition.condition.chronicDefault;
            const isTreatable = patientCondition.treatableOverride ?? patientCondition.condition.treatableDefault;

            return {
              id: patientCondition.id,
              conditionId: patientCondition.conditionId,
              condition: {
                id: patientCondition.condition.id,
                name: patientCondition.condition.name,
                icd10: patientCondition.condition.icd10,
                flags: {
                  chronicDefault: patientCondition.condition.chronicDefault,
                  treatableDefault: patientCondition.condition.treatableDefault,
                  allowRecurrence: patientCondition.condition.allowRecurrence,
                  typicalDurationDays: patientCondition.condition.typicalDurationDays
                },
                synonyms: patientCondition.condition.synonyms.map(s => s.value)
              },
              source: patientCondition.source,
              status: patientCondition.status,
              onsetDate: patientCondition.onsetDate,
              resolutionDate: patientCondition.resolutionDate,
              chronicOverride: patientCondition.chronicOverride,
              treatableOverride: patientCondition.treatableOverride,
              severity: patientCondition.severity,
              notes: patientCondition.notes,
              appointmentId: patientCondition.appointmentId,
              lastReviewedAt: patientCondition.lastReviewedAt,
              locked: patientCondition.locked,
              isChronic,
              isTreatable,
              occurrences: patientCondition.occurrences,
              createdAt: patientCondition.createdAt,
              updatedAt: patientCondition.updatedAt
            };
          } else {
            // Para qualquer outra mudança em atendimento finalizado, bloquear
            throw new Error('Não é possível editar diagnósticos de atendimentos finalizados. Apenas marcar como resolvido é permitido.');
          }
        }
      }

      // Para condições não relacionadas a atendimentos finalizados, permitir edições normais
      
      // Para outras mudanças, verificar se não está tentando editar uma condição resolvida
      if (currentCondition.status === 'RESOLVED') {
        throw new Error('Não é possível editar uma condição já resolvida');
      }

      // Se está marcando como resolvida, encerrar episódio atual
      if (data.status === 'RESOLVED' && currentCondition.status === 'ACTIVE') {
        // Buscar o episódio atual (mais recente sem data de fim)
        const currentOccurrence = await this.prisma.conditionOccurrence.findFirst({
          where: {
            patientConditionId: pcId,
            endAt: null
          },
          orderBy: { startAt: 'desc' }
        });

        // Se há um episódio ativo, encerrá-lo
        if (currentOccurrence) {
          await this.prisma.conditionOccurrence.update({
            where: { id: currentOccurrence.id },
            data: { 
              endAt: data.resolutionDate ? new Date(data.resolutionDate) : new Date()
            }
          });
        }
      }

      // Permitir edições normais para condições ativas
      const patientCondition = await this.prisma.patientCondition.update({
        where: { 
          id: pcId,
          patientId
        },
        data: {
          status: data.status,
          onsetDate: data.onsetDate ? new Date(data.onsetDate + 'T00:00:00') : null,
          resolutionDate: data.resolutionDate ? new Date(data.resolutionDate + 'T00:00:00') : null,
          chronicOverride: data.chronicOverride,
          treatableOverride: data.treatableOverride,
          severity: data.severity,
          notes: data.notes,
          lastReviewedAt: new Date()
        },
        include: {
          condition: {
            include: {
              synonyms: true
            }
          },
          occurrences: {
            orderBy: { startAt: 'desc' }
          }
        }
      });

      const isChronic = patientCondition.chronicOverride ?? patientCondition.condition.chronicDefault;
      const isTreatable = patientCondition.treatableOverride ?? patientCondition.condition.treatableDefault;

                  return {
              id: patientCondition.id,
              conditionId: patientCondition.conditionId,
              condition: {
                id: patientCondition.condition.id,
                name: patientCondition.condition.name,
                icd10: patientCondition.condition.icd10,
                flags: {
                  chronicDefault: patientCondition.condition.chronicDefault,
                  treatableDefault: patientCondition.condition.treatableDefault,
                  allowRecurrence: patientCondition.condition.allowRecurrence,
                  typicalDurationDays: patientCondition.condition.typicalDurationDays
                },
                synonyms: patientCondition.condition.synonyms.map(s => s.value)
              },
              source: patientCondition.source,
              status: patientCondition.status,
              onsetDate: patientCondition.onsetDate,
              resolutionDate: patientCondition.resolutionDate,
              chronicOverride: patientCondition.chronicOverride,
              treatableOverride: patientCondition.treatableOverride,
              severity: patientCondition.severity,
              notes: patientCondition.notes,
              appointmentId: patientCondition.appointmentId,
              lastReviewedAt: patientCondition.lastReviewedAt,
              locked: patientCondition.locked,
              isChronic,
              isTreatable,
              occurrences: patientCondition.occurrences,
              createdAt: patientCondition.createdAt,
              updatedAt: patientCondition.updatedAt
            };
    } catch (error) {
      console.error('Erro ao atualizar condição do paciente:', error);
      throw error;
    }
  }

  async createOccurrence(patientId: string, pcId: string, data: any) {
    // Verificar se a condição pertence ao paciente
    const patientCondition = await this.prisma.patientCondition.findFirstOrThrow({
      where: { id: pcId, patientId }
    });

    // Se a condição está curada (RESOLVED), mudar para ativa (ACTIVE) ao criar novo episódio
    const shouldActivate = patientCondition.status === 'RESOLVED';
    
    // Se o episódio tem data de fim, marcar a condição como curada
    const shouldResolve = data.endAt && patientCondition.status === 'ACTIVE';

    const [occurrence] = await this.prisma.$transaction([
      // Criar a ocorrência - corrigir timezone para evitar problemas de data
      this.prisma.conditionOccurrence.create({
        data: {
          patientConditionId: pcId,
          startAt: new Date(data.startAt + 'T00:00:00'), // Forçar meia-noite no timezone local
          endAt: data.endAt ? new Date(data.endAt + 'T00:00:00') : null, // Forçar meia-noite no timezone local
          notes: data.notes
        }
      }),
      // Se necessário, ativar a condição
      ...(shouldActivate ? [
        this.prisma.patientCondition.update({
          where: { id: pcId },
          data: {
            status: 'ACTIVE',
            resolutionDate: null, // Limpar data de resolução
            lastReviewedAt: new Date()
          }
        })
      ] : []),
      // Se necessário, marcar como curada
      ...(shouldResolve ? [
        this.prisma.patientCondition.update({
          where: { id: pcId },
          data: {
            status: 'RESOLVED',
            resolutionDate: new Date(data.endAt), // Usar a data de fim do episódio
            lastReviewedAt: new Date()
          }
        })
      ] : [])
    ]);

    return occurrence;
  }

  async updateOccurrence(patientId: string, pcId: string, occId: string, data: any) {
    // Verificar se a ocorrência pertence à condição do paciente
    await this.prisma.conditionOccurrence.findFirstOrThrow({
      where: { 
        id: occId,
        patientCondition: {
          id: pcId,
          patientId
        }
      }
    });

    const occurrence = await this.prisma.conditionOccurrence.update({
      where: { id: occId },
      data: {
        endAt: data.endAt ? new Date(data.endAt + 'T00:00:00') : null, // Forçar meia-noite no timezone local
        notes: data.notes
      }
    });

    return occurrence;
  }
}
