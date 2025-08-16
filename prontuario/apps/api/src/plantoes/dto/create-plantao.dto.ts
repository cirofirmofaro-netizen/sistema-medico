import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { TipoVinculo, StatusPlantao } from '@prisma/client';

export class CreatePlantaoDto {
  @IsOptional()
  @IsString()
  modeloId?: string;

  @IsString()
  fontePagadoraId: string;

  @IsDateString()
  data: string; // data do plantão

  @IsDateString()
  inicio: string;

  @IsDateString()
  fim: string;

  @IsString()
  local: string;

  @IsString()
  cnpj: string;

  @IsNumber()
  valorPrevisto: number;

  @IsEnum(TipoVinculo)
  tipoVinculo: TipoVinculo;

  @IsOptional()
  @IsEnum(StatusPlantao)
  status?: StatusPlantao;

  @IsOptional()
  @IsBoolean()
  ehTroca?: boolean;

  @IsOptional()
  @IsString()
  trocaCom?: string;

  @IsOptional()
  @IsString()
  motivoTroca?: string;

  @IsOptional()
  @IsDateString()
  reagendadoPara?: string;
}
