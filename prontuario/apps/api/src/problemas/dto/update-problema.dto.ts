import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemaDto } from './create-problema.dto';
export class UpdateProblemaDto extends PartialType(CreateProblemaDto) {}
