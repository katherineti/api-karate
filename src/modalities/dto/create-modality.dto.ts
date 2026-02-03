import { IsString, IsNotEmpty } from 'class-validator';

export class CreateModalityDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la modalidad es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de la modalidad es obligatorio' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'El estilo de la modalidad es obligatorio' })
  style: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción de la modalidad es obligatoria' })
  description: string;
/* 
  @IsEnum(['kata', 'combate'], {
    message: 'El tipo debe ser "kata" o "combate"',
  })
  @IsNotEmpty()
  type: string; */
}