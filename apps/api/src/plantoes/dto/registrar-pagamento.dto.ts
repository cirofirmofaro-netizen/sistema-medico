import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RegistrarPagamentoDto {
  @IsOptional() @IsDateString() dtPrevista?: string;
  @IsOptional() @IsDateString() dtPgto?: string;

  @IsNumber() @Min(0) valorPago!: number;

  @IsOptional() @IsString() comprovanteKey?: string;
  @IsOptional() @IsString() obs?: string;
}
