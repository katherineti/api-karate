import { IsNumber, IsBoolean } from 'class-validator';

export class ToggleEventCategoryDto {
  @IsNumber()
  event_id: number;

  @IsNumber()
  category_id: number;

  @IsBoolean()
  is_active: boolean;
}