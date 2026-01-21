import { PartialType } from '@nestjs/mapped-types';
import { CreateEventConfigDto } from './create-event-config.dto';

export class UpdateEventConfigDto extends PartialType(CreateEventConfigDto) {}
