import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  base_score?: number; // Puntaje Máximo de Evaluación

  @IsBoolean()
  @IsOptional()
  is_active?: boolean; // Permite habilitar/inhabilitar
}