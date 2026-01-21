import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  category: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  age_range: string;

  // Columna opcional de cinturones permitidos
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  allowed_belts?: number[];
}