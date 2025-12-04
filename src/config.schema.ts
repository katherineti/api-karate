import * as joi from "joi"
const configSchema = joi.object({
    JWT_SECRET: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    ENV: joi.string().valid("development", "production").default("development"),
    PORT: joi.number().default(3000),
})