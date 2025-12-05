import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsNumber,
} from 'class-validator';

export class SignupDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  
  @IsNotEmpty()
  @IsNumber()
  roles_id: number;
}