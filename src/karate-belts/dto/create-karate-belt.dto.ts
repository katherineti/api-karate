import { IsNotEmpty, IsString, IsInt, Min, MaxLength, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKarateBeltDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del cinturón es obligatorio' })
  @MaxLength(100)
  belt: string;

  @IsString()
  @IsOptional() // Puede ser opcional si algunos cinturones no tienen grado oficial
  @MaxLength(50)
  grade?: string;

/*   @IsString()
  @IsNotEmpty()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'El color debe ser un formato hexadecimal válido (ej: #FF0000)',
  })
  color_hex: string; */

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'El rango debe ser al menos 1' })
  rank_order: number;
}