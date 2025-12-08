import { IsString, IsNumber, IsNotEmpty, IsEmail, IsOptional, IsDecimal, IsArray } from 'class-validator';

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

    // @IsNotEmpty()
    // roles_id: number;

    @IsArray() //  Valida que la entrada sea un array
    @IsNotEmpty() // Valida que el array no esté vacío (al menos un rol)
    @IsNumber({}, { each: true }) //  Valida que CADA elemento del array sea un número
    roles_ids: number[];
      
    // created_at: Date;
    
    // @IsNumber()
    // @IsNotEmpty()
    // status: number; 
}