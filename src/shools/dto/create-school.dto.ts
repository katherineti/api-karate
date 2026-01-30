import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number) // <--- Fuerza la conversión de String a Number
  base_score?: number;
}