import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto {
  
  @IsNotEmpty()
  //@IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}