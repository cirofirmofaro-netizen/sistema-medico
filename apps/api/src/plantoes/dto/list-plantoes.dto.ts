import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { StatusPgto } from './create-plantao.dto';

export class ListPlantoesDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;

  @IsOptional() @IsString() contratante?: string;
  @IsOptional() @IsString() tipo?: string;

  @IsOptional() @IsEnum(StatusPgto) statusPgto?: StatusPgto;

  @IsOptional() @IsInt() @Min(0) skip?: number;
  @IsOptional() @IsInt() @Min(1) take?: number;
}
