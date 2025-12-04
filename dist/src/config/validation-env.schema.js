"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchema = void 0;
const joi = require("joi");
exports.validationSchema = joi.object({
    JWT_SECRET: joi.string().required(),
    DATABASE_URL: joi.string()
        .uri()
        .required()
        .messages({
        'any.required': 'DATABASE_URL es requerida para conectar con Postgres.',
        'string.uri': 'DATABASE_URL debe ser una URL válida.',
    }),
    NODE_ENV: joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: joi.number().default(3000),
});
//# sourceMappingURL=validation-env.schema.js.map