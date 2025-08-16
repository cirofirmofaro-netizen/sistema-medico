import { PartialType } from '@nestjs/mapped-types';
import { CreateAlergiaDto } from './create-alergia.dto';
export class UpdateAlergiaDto extends PartialType(CreateAlergiaDto) {}
