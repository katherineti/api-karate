/* import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsNumber()
  @IsOptional()
  status_id?: number;
} */
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  status_id?: number;

  @IsString()
  @IsOptional()
  poster_front_url?: string;

  @IsString()
  @IsOptional()
  poster_back_url?: string;
}