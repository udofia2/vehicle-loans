export default () => ({
  // Application Configuration
  app: {
    name: process.env.APP_NAME || 'Autochek Backend API',
    version: process.env.APP_VERSION || '1.0.0',
    prefix: process.env.APP_PREFIX || 'api/v1',
    port: parseInt(process.env.PORT, 10) || 3000,
    environment: process.env.NODE_ENV || 'development',
  },

  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    database: process.env.DB_DATABASE || ':memory:',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || true,
    logging: process.env.DB_LOGGING === 'true' || true,
  },

  // External APIs Configuration
  externalApis: {
    rapidApi: {
      key: process.env.RAPIDAPI_KEY,
      host: process.env.RAPIDAPI_HOST || 'vin-lookup2.p.rapidapi.com',
    },
    vinLookup: {
      baseUrl:
        process.env.VIN_DECODER_API_URL || 'https://vin-lookup2.p.rapidapi.com',
      endpoint: '/vehicle-lookup',
    },
    valuation: {
      baseUrl: process.env.VALUATION_API_URL,
      endpoint: '/valuation',
    },
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  },

  // Rate Limiting Configuration
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});
