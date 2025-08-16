import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
export class FinalizeDto {
  @IsString() @IsNotEmpty() filename!: string;
  @IsString() @IsNotEmpty() mimeType!: string;
  @IsInt() @Min(1) size!: number;
  @IsString() @IsNotEmpty() storageKey!: string;
  @IsOptional() @IsString() urlPublica?: string;
}
