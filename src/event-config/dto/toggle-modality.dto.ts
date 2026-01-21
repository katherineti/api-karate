import { IsNumber, IsBoolean } from 'class-validator';

export class ToggleModalityDto {
  @IsNumber() event_id: number;
  @IsNumber() category_id: number;
  @IsNumber() modality_id: number;
  @IsBoolean() is_active: boolean;
}