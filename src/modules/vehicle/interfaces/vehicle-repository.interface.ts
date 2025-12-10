import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Vehicle } from '../entities/vehicle.entity';
import { VehicleSearchCriteria, PaginatedResponse } from '../../../common/types';
import { PaginationOptions } from '../../../common/types';

export interface VehicleRepository extends BaseRepository<Vehicle> {
  findByVin(vin: string): Promise<Vehicle | null>;
  searchVehicles(
    criteria: VehicleSearchCriteria,
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<Vehicle>>;
  findByMakeAndModel(make: string, model: string): Promise<Vehicle[]>;
  findByYearRange(minYear: number, maxYear: number): Promise<Vehicle[]>;
}