import { IsDateString, IsOptional, IsString } from 'class-validator';
export class CreateMedicacaoDto {
  @IsString() pacienteId!: string;
  @IsString() nome!: string;
  @IsOptional() @IsString() dose?: string;
  @IsOptional() @IsString() via?: string;
  @IsOptional() @IsString() frequencia?: string;
  @IsOptional() @IsDateString() inicioEm?: string;
  @IsOptional() @IsDateString() terminoEm?: string;
}
