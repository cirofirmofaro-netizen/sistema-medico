import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { StatusPagamento, MeioPagamento } from '@prisma/client';

export class CreatePagamentoDto {
  @IsOptional()
  @IsString()
  plantaoId?: string;

  @IsString()
  fontePagadoraId: string;

  @IsString()
  competencia: string; // formato AAAA-MM

  @IsNumber()
  valorPrevisto: number;

  @IsNumber()
  valorPago: number;

  @IsOptional()
  @IsDateString()
  dataPagamento?: string;

  @IsOptional()
  @IsEnum(StatusPagamento)
  status?: StatusPagamento;

  @IsEnum(MeioPagamento)
  meio: MeioPagamento;

  @IsOptional()
  @IsString()
  nfId?: string;
}
