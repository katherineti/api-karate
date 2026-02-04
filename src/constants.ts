import 'dotenv/config';

export const PG_CONNECTION = 'PG_CONNECTION';
export const JWTSecret = process.env.JWT_SECRET; //accede a la variable JWT_SECRET en el archivo enviroment
export const API_BASE_URL_PROD = process.env.NEXT_PUBLIC_API_BASE_URL; //accede a la variable JWT_SECRET en el archivo enviroment
export const STATUS_ACTIVO = 1;
export const STATUS_INACTIVO = 2;
export const STATUS_UPDATED = 3;

export const ROL_MASTER = 2;
export const ROL_ALUMNO = 5;

export const ROL_ADMIN = 1;
export const ROL_JUEZ = 3;
export const ROL_REPRESENTANTE = 4;


export const jwtConstants = {
    secret: process.env.JWT_SECRET
};