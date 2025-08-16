import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
export class CreateProblemaDto {
  @IsString() pacienteId!: string;
  @IsString() titulo!: string;
  @IsOptional() @IsString() cid?: string;
  @IsOptional() @IsEnum(['ATIVO','RESOLVIDO'] as any) status?: any;
  @IsOptional() @IsDateString() inicioEm?: string;
  @IsOptional() @IsDateString() terminoEm?: string;
  @IsOptional() @IsString() notas?: string;
}
