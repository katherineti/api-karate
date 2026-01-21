import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateModalityDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la modalidad es obligatorio' })
  name: string;

  @IsEnum(['kata', 'combate'], {
    message: 'El tipo debe ser "kata" o "combate"',
  })
  @IsNotEmpty()
  type: string;
}