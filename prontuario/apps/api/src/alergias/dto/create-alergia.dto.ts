import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
export class CreateAlergiaDto {
  @IsString() pacienteId!: string;
  @IsString() descricao!: string;
  @IsOptional() @IsString() reacao?: string;
  @IsOptional() @IsEnum(['LEVE','MODERADA','GRAVE'] as any) severidade?: any;
  @IsOptional() @IsDateString() observadoEm?: string;
}
