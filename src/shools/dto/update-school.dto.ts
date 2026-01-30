import { Transform } from 'class-transformer';
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

  @IsOptional()
  // Quitamos @IsBoolean() momentáneamente para probar, ya que a veces choca con el string
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  is_active?: string;
  
}