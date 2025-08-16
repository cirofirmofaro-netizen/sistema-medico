import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProntuarioService {
  constructor(private prisma: PrismaService) {}

  async listNotes(patientId: string) {
    // Buscar atendimentos do paciente e suas evoluções
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        evolucoes: {
          include: {
            autor: {
              select: {
                nome: true,
              }
            }
          },
          orderBy: {
            registradoEm: 'desc'
          }
        }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });

    // Transformar para o formato esperado pelo frontend
    const notes: any[] = [];
    for (const atendimento of atendimentos) {
      for (const evolucao of atendimento.evolucoes) {
        notes.push({
          id: evolucao.id,
          patientId,
          titulo: evolucao.resumo,
          conteudo: evolucao.texto,
          autor: evolucao.autor ? `Dr. ${evolucao.autor.nome}` : 'Dr. Usuário',
          createdAt: evolucao.registradoEm.toISOString(),
          updatedAt: evolucao.registradoEm.toISOString(),
        });
      }
    }

    return notes;
  }

  async createNote(patientId: string, data: any) {
    // Usar o serviço de atendimentos para criar ou buscar atendimento do dia
    const atendimento = await this.getOrCreateAtendimentoDoDia(patientId);

    // Criar a evolução
          const evolucao = await this.prisma.evolucao.create({
        data: {
          atendimentoId: atendimento.id,
          authorId: data.authorId || 'system',
          resumo: data.titulo,
          texto: data.conteudo,
          registradoEm: new Date(),
        } as any,
      include: {
        autor: {
          select: {
            nome: true,
          }
        }
      }
    });

    return {
      id: evolucao.id,
      patientId,
      titulo: evolucao.resumo,
      conteudo: evolucao.texto,
      autor: evolucao.autor ? `Dr. ${evolucao.autor.nome}` : 'Dr. Usuário',
      createdAt: evolucao.registradoEm.toISOString(),
      updatedAt: evolucao.registradoEm.toISOString(),
    };
  }

  async updateNote(noteId: string, data: any) {
    const evolucao = await this.prisma.evolucao.findUnique({
      where: { id: noteId },
      include: {
        autor: {
          select: {
            nome: true,
          }
        }
      }
    });

    if (!evolucao) {
      throw new NotFoundException('Evolução não encontrada');
    }

    // Verificar se o atendimento está finalizado
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: evolucao.atendimentoId }
    });

    if (atendimento?.status === 'FINALIZADO') {
      throw new Error('Não é possível editar evoluções de atendimentos finalizados');
    }

    // Criar nova versão
    await this.prisma.evolucaoVersion.create({
      data: {
        evolucaoId: evolucao.id,
        texto: evolucao.texto,
        changedBy: data.authorId || 'system',
        version: evolucao.currentVersion + 1,
      }
    });

    // Atualizar evolução
    const updatedEvolucao = await this.prisma.evolucao.update({
      where: { id: noteId },
      data: {
        resumo: data.titulo,
        texto: data.conteudo,
        currentVersion: evolucao.currentVersion + 1,
      },
      include: {
        autor: {
          select: {
            nome: true,
          }
        }
      }
    });

    return {
      id: updatedEvolucao.id,
      patientId: atendimento?.patientId || '',
      titulo: updatedEvolucao.resumo,
      conteudo: updatedEvolucao.texto,
      autor: updatedEvolucao.autor ? `Dr. ${updatedEvolucao.autor.nome}` : 'Dr. Usuário',
      createdAt: updatedEvolucao.registradoEm.toISOString(),
      updatedAt: updatedEvolucao.registradoEm.toISOString(),
    };
  }

  async listVitals(patientId: string) {
    // Buscar atendimentos do paciente e seus sinais vitais
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        sinaisVitais: {
          orderBy: {
            registradoEm: 'desc'
          }
        }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });

    // Transformar para o formato esperado pelo frontend
    const vitals: any[] = [];
    for (const atendimento of atendimentos) {
      for (const sinaisVitais of atendimento.sinaisVitais) {
        vitals.push({
          id: sinaisVitais.id,
          patientId,
          pressaoSistolica: sinaisVitais.pressaoSistolica,
          pressaoDiastolica: sinaisVitais.pressaoDiastolica,
          frequenciaCardiaca: sinaisVitais.frequenciaCardiaca,
          frequenciaRespiratoria: sinaisVitais.frequenciaRespiratoria,
          temperatura: sinaisVitais.temperatura,
          saturacaoOxigenio: sinaisVitais.saturacaoOxigenio,
          peso: sinaisVitais.peso,
          altura: sinaisVitais.altura,
          observacoes: sinaisVitais.observacoes,
          createdAt: sinaisVitais.registradoEm.toISOString(),
          updatedAt: sinaisVitais.registradoEm.toISOString(),
        });
      }
    }

    return vitals;
  }

  async createVitals(patientId: string, data: any) {
    // Usar o serviço de atendimentos para criar ou buscar atendimento do dia
    const atendimento = await this.getOrCreateAtendimentoDoDia(patientId);

    // Criar os sinais vitais
          const sinaisVitais = await this.prisma.sinaisVitais.create({
        data: {
          atendimentoId: atendimento.id,
          pressaoSistolica: data.pressaoSistolica,
          pressaoDiastolica: data.pressaoDiastolica,
          frequenciaCardiaca: data.frequenciaCardiaca,
          frequenciaRespiratoria: data.frequenciaRespiratoria,
          temperatura: data.temperatura,
          saturacaoOxigenio: data.saturacaoOxigenio,
          peso: data.peso,
          altura: data.altura,
          observacoes: data.observacoes,
          registradoEm: new Date(),
        } as any
    });

    return {
      id: sinaisVitais.id,
      patientId,
      pressaoSistolica: sinaisVitais.pressaoSistolica,
      pressaoDiastolica: sinaisVitais.pressaoDiastolica,
      frequenciaCardiaca: sinaisVitais.frequenciaCardiaca,
      frequenciaRespiratoria: sinaisVitais.frequenciaRespiratoria,
      temperatura: sinaisVitais.temperatura,
      saturacaoOxigenio: sinaisVitais.saturacaoOxigenio,
      peso: sinaisVitais.peso,
      altura: sinaisVitais.altura,
      observacoes: sinaisVitais.observacoes,
      createdAt: sinaisVitais.registradoEm.toISOString(),
      updatedAt: sinaisVitais.registradoEm.toISOString(),
    };
  }

  async listFiles(patientId: string) {
    // Buscar atendimentos do paciente e seus anexos
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        anexos: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });

    // Transformar para o formato esperado pelo frontend
    const files: any[] = [];
    for (const atendimento of atendimentos) {
      for (const anexo of atendimento.anexos) {
        files.push({
          id: anexo.id,
          patientId,
          filename: anexo.filename,
          mimeType: anexo.mimeType,
          size: anexo.size,
          urlPublica: anexo.urlPublica,
          titulo: anexo.titulo,
          tipoDocumento: anexo.tipoDocumento,
          createdAt: anexo.createdAt.toISOString(),
        });
      }
    }

    return files;
  }

  async createFile(patientId: string, data: any) {
    // Usar o serviço de atendimentos para criar ou buscar atendimento do dia
    const atendimento = await this.getOrCreateAtendimentoDoDia(patientId);

    // Criar o anexo
         const anexo = await this.prisma.anexo.create({
       data: {
         atendimentoId: atendimento.id,
         filename: data.filename,
         mimeType: data.mimeType,
         size: data.size,
         storageKey: data.storageKey,
         urlPublica: data.urlPublica,
         titulo: data.titulo,
         tipoDocumento: data.tipoDocumento,
       } as any
    });

    return {
      id: anexo.id,
      patientId,
      filename: anexo.filename,
      mimeType: anexo.mimeType,
      size: anexo.size,
      urlPublica: anexo.urlPublica,
      titulo: anexo.titulo,
      tipoDocumento: anexo.tipoDocumento,
      createdAt: anexo.createdAt.toISOString(),
    };
  }

  private async getOrCreateAtendimentoDoDia(patientId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Buscar atendimento do dia
    let atendimento = await this.prisma.atendimento.findFirst({
      where: {
        patientId,
        serviceDate: {
          gte: hoje,
          lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Se não existe, criar um novo
    if (!atendimento) {
      atendimento = await this.prisma.atendimento.create({
        data: {
          patientId,
          professionalId: 'system', // TODO: usar ID do usuário logado
          serviceDate: hoje,
          startedAt: new Date(),
          status: 'EM_ANDAMENTO',
        } as any
      });
    }

    return atendimento;
  }
}
