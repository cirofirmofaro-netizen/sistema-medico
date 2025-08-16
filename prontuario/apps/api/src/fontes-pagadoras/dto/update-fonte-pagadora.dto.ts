import { PartialType } from '@nestjs/mapped-types';
import { CreateFontePagadoraDto } from './create-fonte-pagadora.dto';

export class UpdateFontePagadoraDto extends PartialType(CreateFontePagadoraDto) {}
