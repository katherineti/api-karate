import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @IsOptional() // Opcional en el body, usará el default de la DB si no se envía
  @Min(0)
  base_score?: number; // El puntaje base de evaluación
}