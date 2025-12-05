// src/common/dto/pagination.dto.ts

import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string; // 💡 Nuevo: Búsqueda por name, lastname, email

  @IsString()
  @IsOptional()
  roleName?: string; // 💡 Nuevo: Búsqueda por rol //debe estart completo el string
}