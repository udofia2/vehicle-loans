export interface VinLookupResponse {
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  bodyStyle?: string;
  fuelType?: string;
  color?: string;
  country?: string;
  manufacturer?: string;
  vehicleType?: string;
  displacement?: string;
  cylinders?: number;
  isValid: boolean;
  errors?: string[];
}
