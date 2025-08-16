import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtendimentoStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AtendimentosService {
  constructor(private prisma: PrismaService) {}

  // Normalizar data para 00:00 UTC do dia
  private normalizeServiceDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  // Obter ou criar atendimento do dia
  async getOrCreateAtendimentoDoDia(
    patientId: string,
    professionalId: string,
    when: Date,
  ) {
    const serviceDate = this.normalizeServiceDate(when);

    // Buscar todos os atendimentos do paciente para este dia
    const atendimentosDoDia = await this.prisma.atendimento.findMany({
      where: {
        patientId,
        serviceDate: {
          gte: serviceDate,
          lt: new Date(serviceDate.getTime() + 24 * 60 * 60 * 1000), // +24 horas
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    // Se não há atendimentos, criar o primeiro
    if (atendimentosDoDia.length === 0) {
      return this.prisma.atendimento.create({
        data: {
          patientId,
          professionalId,
          serviceDate,
          status: AtendimentoStatus.EM_ANDAMENTO,
        } as any,
      });
    }

    // Verificar se há algum atendimento em andamento
    const atendimentoEmAndamento = atendimentosDoDia.find(
      (a) => a.status === AtendimentoStatus.EM_ANDAMENTO,
    );

    if (atendimentoEmAndamento) {
      return atendimentoEmAndamento;
    }

    // Se todos estão finalizados, criar um novo com timestamp único
    const ultimoAtendimento = atendimentosDoDia[0];
    const novoServiceDate = new Date(ultimoAtendimento.serviceDate);
    novoServiceDate.setMinutes(novoServiceDate.getMinutes() + 1);

                     return this.prisma.atendimento.create({
         data: {
           patientId,
           professionalId,
           serviceDate: novoServiceDate,
           status: AtendimentoStatus.EM_ANDAMENTO,
         } as any,
       });
  }

  // Listar atendimentos de um paciente
  async listPatientAtendimentos(patientId: string, from?: Date, to?: Date) {
    const where: any = { patientId };

    if (from || to) {
      where.serviceDate = {};
      if (from) {
        where.serviceDate.gte = this.normalizeServiceDate(from);
      }
      if (to) {
        where.serviceDate.lte = this.normalizeServiceDate(to);
      }
    }

    return this.prisma.atendimento.findMany({
      where,
      include: {
        evolucoes: {
          orderBy: { registradoEm: 'desc' },
        },
        sinaisVitais: {
          orderBy: { registradoEm: 'desc' },
        },
        anexos: {
          orderBy: { createdAt: 'desc' },
        },
        profissional: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });
  }

  // Criar evolução
  async createEvolucao(
    patientId: string,
    professionalId: string,
    data: {
      resumo?: string;
      texto: string;
      when?: Date;
    },
  ) {
    try {
      console.log('Creating evolution:', { patientId, professionalId, data });
      
      const when = data.when || new Date();
      console.log('When date:', when);
      
      const atendimento = await this.getOrCreateAtendimentoDoDia(
        patientId,
        professionalId,
        when,
      );
      
      console.log('Atendimento found/created:', atendimento.id);

      const evolucao = await this.prisma.evolucao.create({
        data: {
          atendimentoId: atendimento.id,
          authorId: professionalId,
          resumo: data.resumo,
          texto: data.texto,
          registradoEm: when,
          currentVersion: 1,
          locked: false,
        } as any,
      });

      console.log('Evolution created:', evolucao.id);

      // Criar versão inicial
      await this.prisma.evolucaoVersion.create({
        data: {
          evolucaoId: evolucao.id,
          version: 1,
          texto: data.texto,
          changedBy: professionalId,
        },
      });

      console.log('Evolution version created successfully');

      return evolucao;
    } catch (error) {
      console.error('Error creating evolution:', error);
      throw error;
    }
  }

  // Atualizar evolução (com versionamento)
  async updateEvolucao(
    evolucaoId: string,
    professionalId: string,
    data: {
      resumo?: string;
      texto: string;
    },
  ) {
    const evolucao = await this.prisma.evolucao.findUnique({
      where: { id: evolucaoId },
      include: { atendimento: true },
    });

    if (!evolucao) {
      throw new ForbiddenException('Evolução não encontrada');
    }

    if (evolucao.locked || evolucao.atendimento.status !== AtendimentoStatus.EM_ANDAMENTO) {
      throw new ForbiddenException(
        'Não é possível editar evoluções em atendimentos finalizados',
      );
    }

    const nextVersion = evolucao.currentVersion + 1;

    // Atualizar evolução e criar nova versão em transação
    const [updatedEvolucao] = await this.prisma.$transaction([
      this.prisma.evolucao.update({
        where: { id: evolucaoId },
        data: {
          resumo: data.resumo,
          texto: data.texto,
          currentVersion: nextVersion,
        },
      }),
      this.prisma.evolucaoVersion.create({
        data: {
          evolucaoId,
          version: nextVersion,
          texto: data.texto,
          changedBy: professionalId,
        },
      }),
    ]);

    return updatedEvolucao;
  }

  // Obter uma evolução específica
  async getEvolucao(evolucaoId: string) {
    const evolucao = await this.prisma.evolucao.findUnique({
      where: { id: evolucaoId },
      include: { autor: { select: { id: true, nome: true } } },
    });
    if (!evolucao) { throw new ForbiddenException('Evolução não encontrada'); }
    return { 
      ...evolucao, 
      author: evolucao.autor, // Mapear autor para author para compatibilidade com frontend
      registradoEm: evolucao.registradoEm.toISOString() 
    };
  }

  // Criar sinais vitais
  async createSinaisVitais(
    patientId: string,
    professionalId: string,
    data: {
      pressaoSistolica: number;
      pressaoDiastolica: number;
      frequenciaCardiaca: number;
      frequenciaRespiratoria: number;
      saturacaoOxigenio: number;
      temperatura: number;
      peso?: number;
      altura?: number;
      observacoes?: string;
      when?: Date;
    },
  ) {
    const when = data.when || new Date();
    
    const atendimento = await this.getOrCreateAtendimentoDoDia(
      patientId,
      professionalId,
      when,
    );

    // Calcular PAM
    const pam = Math.round(
      data.pressaoDiastolica + (data.pressaoSistolica - data.pressaoDiastolica) / 3,
    );

    return this.prisma.sinaisVitais.create({
      data: {
        atendimentoId: atendimento.id,
        usuarioId: professionalId,
        registradoEm: when,
        pressaoSistolica: data.pressaoSistolica,
        pressaoDiastolica: data.pressaoDiastolica,
        frequenciaCardiaca: data.frequenciaCardiaca,
        frequenciaRespiratoria: data.frequenciaRespiratoria,
        saturacaoOxigenio: data.saturacaoOxigenio,
        temperatura: data.temperatura,
        peso: data.peso,
        altura: data.altura,
        observacoes: data.observacoes,
      },
    });
  }

  // Atualizar sinais vitais
  async updateSinaisVitais(
    sinaisVitaisId: string,
    professionalId: string,
    data: {
      pressaoSistolica?: number;
      pressaoDiastolica?: number;
      frequenciaCardiaca?: number;
      frequenciaRespiratoria?: number;
      saturacaoOxigenio?: number;
      temperatura?: number;
      peso?: number;
      altura?: number;
      observacoes?: string;
    },
  ) {
    const sinaisVitais = await this.prisma.sinaisVitais.findUnique({
      where: { id: sinaisVitaisId },
      include: { 
        atendimento: true,
        usuario: { select: { id: true, nome: true } }
      },
    });

    if (!sinaisVitais) {
      throw new ForbiddenException('Sinais vitais não encontrados');
    }

    if (sinaisVitais.atendimento.status !== AtendimentoStatus.EM_ANDAMENTO) {
      throw new ForbiddenException(
        'Não é possível editar sinais vitais em atendimentos finalizados',
      );
    }

    return this.prisma.sinaisVitais.update({
      where: { id: sinaisVitaisId },
      data,
      include: {
        usuario: { select: { id: true, nome: true } }
      }
    });
  }

  // Obter sinais vitais específicos
  async getSinaisVitais(sinaisVitaisId: string) {
    const sinaisVitais = await this.prisma.sinaisVitais.findUnique({
      where: { id: sinaisVitaisId },
      include: { 
        atendimento: true,
        usuario: { select: { id: true, nome: true } }
      },
    });

    if (!sinaisVitais) {
      throw new ForbiddenException('Sinais vitais não encontrados');
    }

    return {
      ...sinaisVitais,
      locked: sinaisVitais.atendimento.status === AtendimentoStatus.FINALIZADO,
      registradoEm: sinaisVitais.registradoEm.toISOString()
    };
  }

  // Criar anexo
  async createAnexo(
    patientId: string,
    professionalId: string,
    data: {
      filename: string;
      mimeType: string;
      size: number;
      storageKey: string;
      urlPublica?: string;
      titulo?: string;
      tipoDocumento?: string;
      when?: Date;
    },
  ) {
    const when = data.when || new Date();
    const atendimento = await this.getOrCreateAtendimentoDoDia(
      patientId,
      professionalId,
      when,
    );

         return this.prisma.anexo.create({
       data: {
         atendimentoId: atendimento.id,
         filename: data.filename,
         mimeType: data.mimeType,
         size: data.size,
         storageKey: data.storageKey,
         urlPublica: data.urlPublica,
         titulo: data.titulo,
         tipoDocumento: data.tipoDocumento,
         createdAt: when,
       } as any,
     });
  }

  // Finalizar atendimento
  async finalizarAtendimento(atendimentoId: string, professionalId: string) {
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id: atendimentoId },
      include: {
        evolucoes: true,
        sinaisVitais: true,
        anexos: true,
      },
    });

    if (!atendimento) {
      throw new ForbiddenException('Atendimento não encontrado');
    }

    if (atendimento.status !== AtendimentoStatus.EM_ANDAMENTO) {
      throw new ConflictException('Atendimento já foi finalizado ou cancelado');
    }

    // Calcular hash do dia (canonical JSON de todo o conteúdo)
    const dayContent = {
      atendimentoId: atendimento.id,
      patientId: atendimento.patientId,
      professionalId: atendimento.professionalId,
      serviceDate: atendimento.serviceDate.toISOString(),
      startedAt: atendimento.startedAt.toISOString(),
      evolucoes: atendimento.evolucoes.map(e => ({
        id: e.id,
        resumo: e.resumo,
        texto: e.texto,
        registradoEm: e.registradoEm.toISOString(),
        currentVersion: e.currentVersion,
      })),
      sinaisVitais: atendimento.sinaisVitais.map(s => ({
        id: s.id,
        pressaoSistolica: s.pressaoSistolica,
        pressaoDiastolica: s.pressaoDiastolica,
        frequenciaCardiaca: s.frequenciaCardiaca,
        frequenciaRespiratoria: s.frequenciaRespiratoria,
        saturacaoOxigenio: s.saturacaoOxigenio,
        temperatura: s.temperatura,
        peso: s.peso,
        altura: s.altura,
        observacoes: s.observacoes,
        registradoEm: s.registradoEm.toISOString(),
      })),
      anexos: atendimento.anexos.map(a => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        storageKey: a.storageKey,
        titulo: a.titulo,
        tipoDocumento: a.tipoDocumento,
        createdAt: a.createdAt.toISOString(),
      })),
    };

    const dayHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(dayContent, Object.keys(dayContent).sort()))
      .digest('hex');

    // Finalizar atendimento e travar todos os registros
    await this.prisma.$transaction([
      this.prisma.atendimento.update({
        where: { id: atendimentoId },
        data: {
          status: AtendimentoStatus.FINALIZADO,
          finishedAt: new Date(),
          dayHash,
        },
      }),
      this.prisma.evolucao.updateMany({
        where: { atendimentoId },
        data: { locked: true },
      }),
      // Travar condições diagnosticadas neste atendimento
      this.prisma.patientCondition.updateMany({
        where: { appointmentId: atendimentoId },
        data: { locked: true },
      }),
    ]);

    return { success: true, dayHash };
  }

  // Obter histórico de versões de uma evolução
  async getEvolucaoVersions(evolucaoId: string) {
    return this.prisma.evolucaoVersion.findMany({
      where: { evolucaoId },
      include: {
        changedByUser: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { version: 'desc' },
    });
  }

  // Listar sinais vitais do paciente
  async listSinaisVitais(patientId: string) {
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        sinaisVitais: {
          include: {
            usuario: { select: { id: true, nome: true } }
          },
          orderBy: { registradoEm: 'desc' }
        }
      },
      orderBy: { serviceDate: 'desc' }
    });

    // Flatten e adicionar informação de locked
    const sinaisVitais = atendimentos.flatMap(atendimento =>
      atendimento.sinaisVitais.map(vital => ({
        ...vital,
        locked: atendimento.status === AtendimentoStatus.FINALIZADO,
        registradoEm: vital.registradoEm.toISOString()
      }))
    );

    return sinaisVitais;
  }

  // Listar anexos de um paciente
  async listAnexos(patientId: string) {
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        anexos: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    // Flatten dos anexos de todos os atendimentos
    return atendimentos.flatMap(atendimento => 
      atendimento.anexos.map(anexo => ({
        ...anexo,
        createdAt: anexo.createdAt.toISOString(),
      }))
    );
  }

  // Listar evoluções de um paciente
  async listEvolucoes(patientId: string) {
    const atendimentos = await this.prisma.atendimento.findMany({
      where: { patientId },
      include: {
        evolucoes: {
          include: {
            autor: {
              select: { id: true, nome: true },
            },
          },
          orderBy: { registradoEm: 'desc' },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    // Flatten das evoluções de todos os atendimentos
    return atendimentos.flatMap(atendimento => 
      atendimento.evolucoes.map(evolucao => ({
        ...evolucao,
        author: evolucao.autor, // Mapear autor para author para compatibilidade com frontend
        registradoEm: evolucao.registradoEm.toISOString(),
      }))
    );
  }
}
