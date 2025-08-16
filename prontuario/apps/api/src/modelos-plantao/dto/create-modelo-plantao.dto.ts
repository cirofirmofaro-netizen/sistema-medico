import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { TipoVinculo, Pagador } from '@prisma/client';

export class CreateModeloPlantaoDto {
  @IsString()
  fontePagadoraId: string;

  @IsString()
  local: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString()
  inicioPadrao: string; // formato HH:mm

  @IsString()
  fimPadrao: string; // formato HH:mm

  @IsNumber()
  duracaoMin: number;

  @IsNumber()
  valorPrevisto: number;

  @IsEnum(TipoVinculo)
  tipoVinculo: TipoVinculo;

  @IsEnum(Pagador)
  pagador: Pagador;

  @IsOptional()
  @IsBoolean()
  fixo?: boolean;

  @IsOptional()
  @IsObject()
  recorrencia?: {
    freq: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    byWeekday?: number[];
    interval?: number;
  };

  @IsOptional()
  @IsString()
  observacoes?: string;
}
