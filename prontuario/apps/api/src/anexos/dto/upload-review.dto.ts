import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PresignTempDto {
  @ApiProperty({ description: 'Nome do arquivo' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Tipo MIME do arquivo' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'Tamanho do arquivo em bytes', required: false })
  @IsOptional()
  @IsNumber()
  size?: number;
}

export class CommitTempDto {
  @ApiProperty({ description: 'Chave do arquivo temporário' })
  @IsString()
  @IsNotEmpty()
  keyTemp: string;

  @ApiProperty({ description: 'ID do paciente' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'Tipo do documento', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  observacao?: string;

  @ApiProperty({ description: 'Tipo MIME do arquivo' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'Nome original do arquivo' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'Tamanho do arquivo em bytes' })
  @IsNumber()
  size: number;
}
