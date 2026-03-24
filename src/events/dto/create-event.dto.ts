import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsDateString, 
  IsNumber, 
  Min, 
  MaxLength, 
  Max, 
  IsBoolean, 
  IsArray 
} from 'class-validator';
import { Type } from 'class-transformer'; // 👈 Importante para la conversión de tipos

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

  @Type(() => Number) // 👈 Convierte el string de Postman a número
  @IsNumber()
  @IsNotEmpty()
  subtype_id: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100) 
  max_evaluation_score?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  max_participants?: number;

  @Type(() => Boolean) // 👈 Convierte strings como "true" o "1" a booleano real
  @IsBoolean()
  @IsOptional()
  send_to_all_masters?: boolean;

  @Type(() => Number) // 👈 Asegura que cada elemento del arreglo sea un número
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  selected_master_ids?: number[];

  // --- Campos para las Imágenes (Rutas que guardará el controlador) ---
  
  @IsString()
  @IsOptional()
  poster_front_url?: string;

  @IsString()
  @IsOptional()
  poster_back_url?: string;
}