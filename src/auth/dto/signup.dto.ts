import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
  IsOptional,
} from 'class-validator';

export class SignupDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true }) //  Valida que CADA elemento del array sea un número
  roles_ids: number[];

  @IsOptional()
  @IsNumber()
  school_id?: number;
}