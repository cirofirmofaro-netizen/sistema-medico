import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class ExportProntuarioDto {
  @IsString()
  pacienteId!: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsBoolean()
  incluirAnexos?: boolean;
}
