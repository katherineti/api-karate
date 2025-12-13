import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEmail, IsArray } from 'class-validator';

export class UpdateUserDto{
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    @IsString()
    @IsOptional()
    document_type: string;

    @IsString()
    @IsOptional()
    document_number: string;

    @IsString()
    @IsOptional()
    birthdate: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    profile_picture: string;

    @IsNumber()
    @IsOptional()
    school_id: number;

    @IsNumber()
    @IsOptional()
    representative_id: number;

    @IsArray() 
    @IsNotEmpty() 
    @IsNumber({}, { each: true })
    roles_ids: number[];

    @IsNumber()
    @IsOptional()
    category_id: number;

    @IsNumber()
    @IsOptional()
    belt_id: number;
}