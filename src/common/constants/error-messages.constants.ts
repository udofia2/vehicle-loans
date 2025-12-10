export const ERROR_MESSAGES = {
  // General Errors
  INTERNAL_SERVER_ERROR:
    'An unexpected error occurred. Please try again later.',
  BAD_REQUEST: 'The request is invalid. Please check your input.',
  UNAUTHORIZED: 'Authentication required. Please provide valid credentials.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'Resource already exists or conflicts with existing data.',
  UNPROCESSABLE_ENTITY: 'The request data is invalid.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',

  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_FORMAT: 'Invalid format provided',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PHONE: 'Please provide a valid phone number',
    INVALID_VIN:
      'VIN must be exactly 17 characters and contain only valid characters',
    INVALID_YEAR: 'Year must be between 1990 and current year + 1',
    INVALID_MILEAGE: 'Mileage must be a positive number',
    INVALID_AMOUNT: 'Amount must be a positive number',
    INVALID_ENUM: 'Invalid value. Please select from available options',
    MIN_LENGTH: 'Value is too short',
    MAX_LENGTH: 'Value is too long',
    MIN_VALUE: 'Value is too small',
    MAX_VALUE: 'Value is too large',
  },

  // Vehicle Errors
  VEHICLE: {
    NOT_FOUND: 'Vehicle not found',
    VIN_ALREADY_EXISTS: 'A vehicle with this VIN already exists',
    INVALID_VIN: 'Invalid VIN format or checksum',
    VIN_DECODE_FAILED: 'Failed to decode VIN information',
    INVALID_CONDITION: 'Invalid vehicle condition',
    INVALID_TRANSMISSION: 'Invalid transmission type',
    INVALID_FUEL_TYPE: 'Invalid fuel type',
    YEAR_OUT_OF_RANGE: `Vehicle year must be between ${new Date().getFullYear() - 50} and ${new Date().getFullYear() + 1}`,
    MILEAGE_NEGATIVE: 'Vehicle mileage cannot be negative',
    MILEAGE_TOO_HIGH: 'Vehicle mileage seems unrealistically high',
  },

  // Valuation Errors
  VALUATION: {
    NOT_FOUND: 'Valuation not found',
    VEHICLE_NOT_FOUND: 'Vehicle not found for valuation',
    VALUATION_FAILED: 'Failed to obtain vehicle valuation',
    EXTERNAL_API_ERROR: 'External valuation service is currently unavailable',
    INVALID_VALUATION_DATA: 'Received invalid valuation data',
    VALUATION_EXPIRED: 'Valuation has expired and needs to be updated',
    MIN_VALUE_GREATER_THAN_MAX:
      'Minimum value cannot be greater than maximum value',
    NEGATIVE_VALUE: 'Valuation amount cannot be negative',
  },

  // Loan Application Errors
  LOAN: {
    NOT_FOUND: 'Loan application not found',
    VEHICLE_NOT_FOUND: 'Vehicle not found for loan application',
    VALUATION_NOT_FOUND: 'Vehicle valuation not found for loan application',
    VALUATION_REQUIRED: 'Vehicle must be valuated before loan application',
    ALREADY_EXISTS: 'A loan application already exists for this vehicle',
    INVALID_STATUS: 'Invalid loan application status',
    INVALID_EMPLOYMENT_STATUS: 'Invalid employment status',
    AMOUNT_TOO_LOW: 'Requested loan amount is below minimum limit',
    AMOUNT_TOO_HIGH: 'Requested loan amount exceeds maximum limit',
    AMOUNT_EXCEEDS_VEHICLE_VALUE: 'Requested loan amount exceeds vehicle value',
    INVALID_TERM: 'Loan term must be between 12 and 84 months',
    INSUFFICIENT_INCOME:
      'Monthly income is insufficient for requested loan amount',
    POOR_CREDIT_SCORE: 'Credit score does not meet minimum requirements',
    INVALID_MONTHLY_INCOME: 'Monthly income must be a positive number',
    CANNOT_MODIFY_PROCESSED:
      'Cannot modify loan application that has been processed',
    ALREADY_APPROVED: 'Loan application is already approved',
    ALREADY_REJECTED: 'Loan application is already rejected',
  },

  // Offer Errors
  OFFER: {
    NOT_FOUND: 'Loan offer not found',
    LOAN_APPLICATION_NOT_FOUND: 'Loan application not found for offer',
    LOAN_NOT_APPROVED:
      'Loan application must be approved before creating offer',
    INVALID_STATUS: 'Invalid offer status',
    OFFER_EXPIRED: 'This offer has expired',
    OFFER_ALREADY_ACCEPTED: 'This offer has already been accepted',
    OFFER_ALREADY_DECLINED: 'This offer has already been declined',
    INVALID_INTEREST_RATE: 'Interest rate must be between 1% and 30%',
    INVALID_OFFER_AMOUNT: 'Offer amount must be positive',
    CANNOT_MODIFY_ACCEPTED: 'Cannot modify an accepted offer',
  },

  // Database Errors
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    TRANSACTION_FAILED: 'Database transaction failed',
    CONSTRAINT_VIOLATION: 'Database constraint violation',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    FOREIGN_KEY_VIOLATION: 'Referenced record does not exist',
    DATA_TOO_LONG: 'Data too long for column',
  },

  // External API Errors
  EXTERNAL_API: {
    TIMEOUT: 'External service request timed out',
    UNAVAILABLE: 'External service is currently unavailable',
    INVALID_RESPONSE: 'Received invalid response from external service',
    RATE_LIMIT_EXCEEDED: 'External service rate limit exceeded',
    API_KEY_INVALID: 'Invalid API key for external service',
    SERVICE_ERROR: 'External service returned an error',
  },

  // Authentication & Authorization Errors
  AUTH: {
    INVALID_TOKEN: 'Invalid or expired authentication token',
    TOKEN_MISSING: 'Authentication token is missing',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
    ACCOUNT_LOCKED: 'Account is temporarily locked',
    INVALID_CREDENTIALS: 'Invalid username or password',
  },

  // File Upload Errors
  FILE: {
    TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_TYPE: 'Invalid file type',
    UPLOAD_FAILED: 'File upload failed',
    PROCESSING_FAILED: 'File processing failed',
  },
} as const;

// Helper function to get nested error messages
export const getErrorMessage = (
  path: string,
  defaultMessage?: string,
): string => {
  const keys = path.split('.');
  let current: any = ERROR_MESSAGES;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultMessage || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    }
  }

  return typeof current === 'string'
    ? current
    : defaultMessage || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
};
