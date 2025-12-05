import { IsString, IsNumber, IsNotEmpty, IsEmail, IsOptional, IsDecimal } from 'class-validator';

export class CreateUserDto{

    @IsNumber()
    @IsOptional()
    id: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    // @IsString()
    // @IsNotEmpty()
    // gender: string;

    @IsString()
    @IsOptional()
    birthdate: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    // @IsString()
    // @IsNotEmpty()
    // username: string;

    @IsString()
    @IsNotEmpty()
    password: string;  //en la actualizacion de usuario la contraseña no se necesita

    @IsString()
    @IsOptional()
    url_image: string;

    @IsNotEmpty()
    roles_id: number;
      
    // created_at: Date;
    
    // @IsNumber()
    // @IsNotEmpty()
    // status: number; 
}