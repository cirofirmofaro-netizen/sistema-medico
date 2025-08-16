import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async list(q?: { search?: string; page?: number; limit?: number }) {
    const where = q?.search
      ? {
          OR: [
            { nome: { contains: q.search } },
            { cpf: { contains: q.search } },
            { telefone: { contains: q.search } },
          ],
        }
      : {};

    const page = q?.page || 1;
    const limit = q?.limit || 10;
    const skip = (page - 1) * limit;

    const [pacientes, total] = await Promise.all([
      this.prisma.paciente.findMany({ 
        where, 
        orderBy: { nome: 'asc' },
        skip,
        take: limit
      }),
      this.prisma.paciente.count({ where })
    ]);

    return {
      pacientes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(createPacienteDto: CreatePacienteDto) {
    return this.prisma.paciente.create({
      data: {
        nome: createPacienteDto.nome,
        dtNasc: createPacienteDto.dtNasc ? new Date(createPacienteDto.dtNasc) : null,
        sexo: createPacienteDto.sexo,
        cpf: createPacienteDto.cpf,
        telefone: createPacienteDto.telefone,
        email: createPacienteDto.email,
        endereco: createPacienteDto.endereco,
      } as any,
    });
  }

  async byId(id: string) {
    const p = await this.prisma.paciente.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Paciente não encontrado');
    return p;
  }

  async update(id: string, dto: UpdatePacienteDto) {
    await this.byId(id);
    return this.prisma.paciente.update({
      where: { id },
      data: {
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.dtNasc && { dtNasc: new Date(dto.dtNasc) }),
        ...(dto.sexo && { sexo: dto.sexo }),
        ...(dto.cpf && { cpf: dto.cpf }),
        ...(dto.telefone && { telefone: dto.telefone }),
        ...(dto.email && { email: dto.email }),
        ...(dto.endereco && { endereco: dto.endereco }),
      },
    });
  }

  async remove(id: string) {
    await this.byId(id);
    
    // Verificar se há atendimentos registrados para este paciente
    const atendimentosCount = await this.prisma.atendimento.count({
      where: { patientId: id }
    });
    
    if (atendimentosCount > 0) {
      throw new BadRequestException(`Não é possível excluir o paciente. Existem ${atendimentosCount} atendimento(s) registrado(s) para este paciente.`);
    }
    
    return this.prisma.paciente.delete({ where: { id } });
  }
}
