// src/common/dto/pagination.dto.ts

import { IsNumber, Min, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  
  // 💡 Buenas prácticas: Usar @Type para asegurar que los query params son números
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1; // Valor por defecto

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10; // Valor por defecto
}