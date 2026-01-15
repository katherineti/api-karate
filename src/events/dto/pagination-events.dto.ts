import { IsNumber, IsOptional, Min, Max, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationEventsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50) // 🛡️ Protección de memoria: máximo 50 registros por petición
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  typeFilter?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  statusFilter?: number;

  @IsDateString()
  @IsOptional()
  startDateFilter?: string;

  @IsDateString()
  @IsOptional()
  endDateFilter?: string;
}