import { Module } from '@nestjs/common';
import { ProblemasController } from './problemas.controller';
import { ProblemasService } from './problemas.service';
import { PrismaService } from '../prisma/prisma.service';
@Module({ controllers:[ProblemasController], providers:[ProblemasService, PrismaService] })
export class ProblemasModule {}
