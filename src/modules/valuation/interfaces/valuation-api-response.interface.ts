import { VehicleCondition } from '../../../common/enums';

export interface ValuationApiResponse {
  vin: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  estimatedValue: number;
  marketValue: number;
  tradeInValue: number;
  retailValue: number;
  currency: string;
  confidence: number;
  lastUpdated: string;
  factors?: {
    mileage: number;
    condition: number;
    market: number;
    location?: number;
  };
}

export interface ValuationApiRequest {
  vin: string;
  mileage: number;
  condition: VehicleCondition;
}
