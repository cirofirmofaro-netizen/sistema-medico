import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const { email } = createUsuarioDto;

    const existingUser = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, 10);

    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        senha: hashedPassword,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return usuario;
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findById(id);

    const { senha, ...data } = updateUsuarioDto;
    const updateData: any = { ...data };

    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10);
    }

    return this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.usuario.delete({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
