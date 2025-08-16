import { IsString, IsEmail, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { TipoVinculo } from '@prisma/client';

export class CreateFontePagadoraDto {
  @IsString()
  nome: string;

  @IsString()
  cnpj: string;

  @IsEnum(TipoVinculo)
  tipoVinculo: TipoVinculo;

  @IsOptional()
  @IsEmail()
  contatoEmail?: string;

  @IsOptional()
  @IsString()
  contatoFone?: string;

  @IsOptional()
  @IsDateString()
  inicio?: string;

  @IsOptional()
  @IsDateString()
  fim?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
