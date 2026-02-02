import { PartialType } from '@nestjs/mapped-types';
import { CreateKarateBeltDto } from './create-karate-belt.dto';

export class UpdateKarateBeltDto extends PartialType(CreateKarateBeltDto) {}
