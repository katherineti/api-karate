/* import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEmail, IsArray, IsDate, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';

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

/*     @IsString()
    @IsOptional()
    birthdate: string; * /

// Campo de fecha:
    @IsOptional()
    @Type(() => Date) // 👈 1. Convierte la cadena 'YYYY-MM-DD' a un objeto Date. ¡Crucial!
    @IsDate({ message: 'La fecha de nacimiento debe ser un formato de fecha válido.' })
    @MaxDate(new Date(), { message: 'La fecha de nacimiento no puede ser en el futuro.' }) // 👈 2. Detiene fechas futuras.
    readonly birthdate?: Date;

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

    @IsNumber()
    @IsOptional()
    status: number;
} */
import { 
    IsString, 
    IsNumber, 
    IsOptional, 
    IsNotEmpty, 
    IsEmail, 
    IsArray, 
    IsDate, 
    MaxDate 
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto{
    
    // ID (Obligatorio para la actualización)
    @IsNumber({}, { message: 'El ID del usuario debe ser un número válido.' })
    @IsNotEmpty({ message: 'El ID del usuario es requerido para la actualización.' })
    id: number;

    // Nombre
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsOptional()
    name?: string; // Usamos '?' para opcional

    // Apellido
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsOptional()
    lastname?: string;

    // Tipo de Documento
    @IsString({ message: 'El tipo de documento debe ser una cadena de texto válida.' })
    @IsOptional()
    document_type?: string;

    // Número de Documento
    @IsString({ message: 'El número de documento debe ser una cadena de texto válida.' })
    @IsOptional()
    document_number?: string;

    // Fecha de Nacimiento (CRÍTICO para evitar el 500)
    @IsOptional()
    @Type(() => Date) // Transforma la cadena "YYYY-MM-DD" en un objeto Date
    @IsDate({ message: 'La fecha de nacimiento debe ser un formato de fecha válido (YYYY-MM-DD).' })
    @MaxDate(new Date(), { message: 'La fecha de nacimiento no puede ser en el futuro.' }) 
    readonly birthdate?: Date; // Se mantiene como Date gracias a @Type

    // Email
    @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida.' })
    @IsString({ message: 'El correo electrónico debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
    email: string;

    // Foto de Perfil
    @IsString({ message: 'La foto de perfil debe ser una URL o cadena de texto válida.' })
    @IsOptional()
    profile_picture?: string;

    // ID de Escuela
    @IsNumber({}, { message: 'El ID de la escuela debe ser un número válido.' })
    @IsOptional()
    school_id?: number;

    // ID de Representante
    @IsNumber({}, { message: 'El ID del representante debe ser un número válido.' })
    @IsOptional()
    representative_id?: number;

    // Roles (Arreglo de IDs)
    @IsArray({ message: 'Los roles deben ser proporcionados como un arreglo (roles_ids).' }) 
    @IsNotEmpty({ message: 'Se debe asignar al menos un rol al usuario.' }) 
    @IsNumber({}, { each: true, message: 'Cada elemento en roles_ids debe ser un número (ID de rol).' })
    roles_ids: number[];

    // ID de Categoría
    @IsNumber({}, { message: 'El ID de la categoría de karate debe ser un número válido.' })
    @IsOptional()
    category_id?: number;

    // ID de Cinturón
    @IsNumber({}, { message: 'El ID del cinturón de karate debe ser un número válido.' })
    @IsOptional()
    belt_id?: number;

    // Estado
    @IsNumber({}, { message: 'El estado del usuario debe ser un número válido (ej: 1 para Activo).' })
    @IsOptional()
    status?: number;
}