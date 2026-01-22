import { IsNumber, IsBoolean, IsArray, IsOptional } from 'class-validator';
export class JudgeAssignmentDto {
  @IsNumber() judge_id: number;
  @IsBoolean() is_active: boolean;
}
export class ToggleModalityDto {
  @IsNumber() event_id: number;
  @IsNumber() category_id: number;
  @IsNumber() modality_id: number;
  @IsBoolean() is_active: boolean;

  @IsOptional()
  @IsArray()
  // Ahora recibimos un objeto con ID y Estado
  judges?: JudgeAssignmentDto[];

//   @IsArray()
//   @IsOptional()
//   @IsNumber({}, { each: true })
//   judges?: number[]; // IDs de los jueces
}