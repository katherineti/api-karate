import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class PaginationSchoolsDto {
  @IsOptional()
  @Type(() => Number) // <--- CRÍTICO: Convierte el string de la petición a número
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number) // <--- CRÍTICO: Convierte el string de la petición a número
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  limit: number = 10;

  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;
}