import * as joi from "joi"
export const validationSchema = joi.object({
    JWT_SECRET: joi.string().required(),
    DATABASE_URL: joi.string()
    .uri() // Opcional: valida que tenga formato de URI
    .required()
    .messages({
      'any.required': 'DATABASE_URL es requerida para conectar con Postgres.',
      'string.uri': 'DATABASE_URL debe ser una URL válida.',
    }),
NODE_ENV: joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
    PORT: joi.number().default(3000),
})