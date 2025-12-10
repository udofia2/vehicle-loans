export const APP_CONSTANTS = {
  // Application Information
  APP_NAME: 'Autochek Backend API',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Vehicle valuation and loan application API',

  // API Configuration
  API_PREFIX: 'api/v1',
  SWAGGER_PATH: 'docs',

  // Pagination Defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,

  // VIN Configuration
  VIN_LENGTH: 17,

  // Valuation Configuration
  DEFAULT_VALUATION_SOURCE: 'external_api',
  VALUATION_EXPIRY_DAYS: 30,

  // Loan Configuration
  MIN_LOAN_AMOUNT: 5000,
  MAX_LOAN_AMOUNT: 100000,
  MIN_LOAN_TERM: 12, // months
  MAX_LOAN_TERM: 84, // months
  DEFAULT_INTEREST_RATE: 8.5,

  // Vehicle Configuration
  MIN_VEHICLE_YEAR: 1990,
  MAX_VEHICLE_YEAR: new Date().getFullYear() + 1,
  MIN_MILEAGE: 0,
  MAX_MILEAGE: 500000,

  // External API Configuration
  EXTERNAL_API_TIMEOUT: 30000, // 30 seconds
  EXTERNAL_API_RETRIES: 3,

  // Rate Limiting
  DEFAULT_RATE_LIMIT: 100,
  DEFAULT_RATE_LIMIT_WINDOW: 60, // seconds

  // HTTP Status Messages
  SUCCESS_MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    FOUND: 'Resource retrieved successfully',
  },

  // Cache Configuration
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },
} as const;

export const REGEX_PATTERNS = {
  VIN: /^[A-HJ-NPR-Z0-9]{17}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
  YEAR: /^(19|20)\d{2}$/,
} as const;

export const DEFAULT_VALUES = {
  PAGINATION: {
    page: 1,
    limit: APP_CONSTANTS.DEFAULT_PAGE_SIZE,
  },
  VEHICLE: {
    condition: 'good',
    transmission: 'automatic',
    fuelType: 'gasoline',
  },
  LOAN: {
    term: 36,
    status: 'pending',
  },
} as const;
