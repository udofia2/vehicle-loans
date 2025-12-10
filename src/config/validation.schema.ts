import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database Configuration
  DB_TYPE: Joi.string().default('sqlite'),
  DB_DATABASE: Joi.string().default(':memory:'),
  DB_SYNCHRONIZE: Joi.boolean().default(true),
  DB_LOGGING: Joi.boolean().default(true),

  // External API Configuration
  RAPID_API_KEY: Joi.string().optional(),
  RAPID_API_HOST: Joi.string().optional(),
  VIN_DECODER_API_URL: Joi.string().optional(),
  VALUATION_API_URL: Joi.string().optional(),

  // Application Configuration
  APP_NAME: Joi.string().default('Autochek Backend API'),
  APP_VERSION: Joi.string().default('1.0.0'),
  APP_PREFIX: Joi.string().default('api/v1'),

  // Security Configuration
  JWT_SECRET: Joi.string().optional(),
  BCRYPT_ROUNDS: Joi.number().default(10),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_LIMIT: Joi.number().default(100),

  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});
