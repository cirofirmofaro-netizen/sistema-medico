import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum StatusPgto {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  PARCIAL = 'PARCIAL',
  ATRASADO = 'ATRASADO',
}

export class CreatePlantaoDto {
  @IsDateString() inicio!: string;
  @IsDateString() fim!: string;

  @IsString() @IsNotEmpty() local!: string;
  @IsString() @IsNotEmpty() contratante!: string;
  @IsString() @IsNotEmpty() tipo!: string;

  @IsNumber() @Min(0) valorBruto!: number;
  @IsOptional() @IsNumber() @Min(0) valorLiquido?: number;

  @IsOptional() @IsEnum(StatusPgto) statusPgto?: StatusPgto;
  @IsOptional() @IsString() notas?: string;
}
