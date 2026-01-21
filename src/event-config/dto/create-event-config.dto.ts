import { IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateEventConfigDto {
  @IsNumber()
  event_id: number;

  @IsNumber()
  category_id: number;

  @IsNumber()
  modality_id: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  max_evaluation_score?: number; // Por defecto será 10 para Katas

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
