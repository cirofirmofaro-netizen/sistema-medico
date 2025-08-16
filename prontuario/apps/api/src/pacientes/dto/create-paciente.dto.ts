import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';
import { IsCPF, TransformCPF, IsPhone } from '../../common/decorators';

export class CreatePacienteDto {
  @ApiProperty({ example: 'Ana Silva' })
  @IsString() nome!: string;

  @ApiProperty({ example: '1990-05-20', required: false })
  @IsOptional() @IsDateString() dtNasc?: string;

  @ApiProperty({ example: 'F', required: false })
  @IsOptional() @IsString() sexo?: string;

  @ApiProperty({ example: '123.456.789-00', required: false })
  @IsOptional() @IsCPF() @TransformCPF() cpf?: string;

  @ApiProperty({ example: '(11) 99999-9999', required: false })
  @IsOptional() @IsPhone() telefone?: string;

  @ApiProperty({ example: 'ana@ex.com', required: false })
  @IsOptional() @IsEmail() email?: string;

  @ApiProperty({ example: 'Rua A, 123', required: false })
  @IsOptional() @IsString() endereco?: string;
}
