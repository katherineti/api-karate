import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
} from 'class-validator';

export class SignupDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  
  @IsArray() //  Valida que la entrada sea un array
  @IsNotEmpty() // Valida que el array no esté vacío (al menos un rol)
  @IsNumber({}, { each: true }) //  Valida que CADA elemento del array sea un número
  roles_ids: number[];
}