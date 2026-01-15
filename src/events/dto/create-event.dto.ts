import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, Min, MaxLength, Max } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Formato YYYY-MM-DD

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsNumber()
  @IsNotEmpty()
  subtype_id: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100) // Ajusta el máximo según las reglas de tu federación de karate
  max_evaluation_score?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  max_participants?: number;
}