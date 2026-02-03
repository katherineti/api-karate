import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, ValidateIf } from 'class-validator';

export class CreateModalityDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la modalidad es obligatorio' })
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
  name: string;


  @IsEnum(['kata', 'combate'], {
    message: 'El tipo debe ser "kata" o "combate"',
  })
  @IsNotEmpty()
  // También normalizamos el tipo a minúsculas para evitar errores
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value)
  type: string;

/*   @IsString()
  @MaxLength(100)
  @IsOptional({ message: 'El estilo de la modalidad es opcional' }) 
  style: string; */

  @ValidateIf(o => o.type === 'kata')
  @IsNotEmpty({ message: 'El estilo es obligatorio para las modalidades de tipo Kata' })
  @IsString()
  @MaxLength(100)
  // @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase().trim() : value)
  style?: string;

  @IsString()
  @IsOptional({ message: 'La descripción de la modalidad es opcional' })
  description: string;
/* 
  @IsEnum(['kata', 'combate'], {
    message: 'El tipo debe ser "kata" o "combate"',
  })
  @IsNotEmpty()
  type: string; */
}