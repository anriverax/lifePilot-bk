import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().integer().positive().default(3001),

  DATABASE_URL: Joi.string().required(),
  POSTGRES_USER: Joi.string().default("postgres"),
  POSTGRES_PASSWORD: Joi.string().default("postgres"),
  POSTGRES_DB: Joi.string().default("lifepilot"),

  REDIS: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().hostname().default("localhost"),
  REDIS_PORT: Joi.number().integer().positive().default(6379),
  REDIS_PASSWORD: Joi.string().allow("").optional(),
  REDIS_TTL: Joi.number().integer().positive().default(3600),

  RESEND: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),

  BETTER_AUTH_SECRET: Joi.string().min(32).required(),
  BETTER_AUTH_URL: Joi.string().uri().optional(),

  CORS_ORIGINS: Joi.string(),

  THROTTLE_TTL: Joi.number().integer().positive().default(60000),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(100),

  PLAIN_TEXT: Joi.string().min(16).required()
});
