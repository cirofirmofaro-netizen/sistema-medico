import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Dr. João Silva' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: 'medico@exemplo.com' })
  @IsEmail({ require_tld: false })
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ example: '12345-SP', required: false })
  @IsOptional()
  @IsString()
  crm?: string;

  @ApiProperty({ example: 'Clínico Geral', required: false })
  @IsOptional()
  @IsString()
  especialidade?: string;

  @ApiProperty({ example: 'medico', required: false })
  @IsOptional()
  @IsString()
  tipo?: string = 'medico';
}
