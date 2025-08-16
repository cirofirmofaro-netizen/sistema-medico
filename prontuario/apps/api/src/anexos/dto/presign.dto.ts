import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
export class PresignDto {
  @IsString() @IsNotEmpty() filename!: string;
  @IsString() @IsNotEmpty() mimeType!: string;
  @IsInt() @Min(1) size!: number;
}
