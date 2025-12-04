"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joi = require("joi");
const configSchema = joi.object({
    JWT_SECRET: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    ENV: joi.string().valid("development", "production").default("development"),
    PORT: joi.number().default(3000),
});
//# sourceMappingURL=config.schema.js.map