import { Module } from '@nestjs/common';
import { EpisodiosController } from './episodios.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({ 
  controllers: [EpisodiosController], 
  providers: [PrismaService] 
})
export class EpisodiosModule {}
