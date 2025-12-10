export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehicleSearchCriteria {
  make?: string;
  model?: string;
  year?: number;
  yearRange?: {
    min: number;
    max: number;
  };
  mileageRange?: {
    min: number;
    max: number;
  };
  condition?: string;
  transmission?: string;
  fuelType?: string;
  color?: string;
}

export interface ValuationMetadata {
  market?: string;
  region?: string;
  trim?: string;
  options?: string[];
  marketTrends?: {
    priceDirection: 'up' | 'down' | 'stable';
    confidence: number;
  };
  comparableVehicles?: number;
  lastUpdated?: Date;
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  paymentSchedule?: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}