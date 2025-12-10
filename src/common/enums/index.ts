export enum VehicleCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt',
  SEMI_AUTOMATIC = 'semi_automatic',
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PLUGIN_HYBRID = 'plugin_hybrid',
  HYDROGEN = 'hydrogen',
}

export enum LoanApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  UNDER_REVIEW = 'under_review',
}

export enum ValuationSource {
  KBB = 'kbb',
  EDMUNDS = 'edmunds',
  NADA = 'nada',
  MANUAL = 'manual',
  EXTERNAL_API = 'external_api',
}