import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Valuation } from '../entities/valuation.entity';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';

export interface ValuationRepository extends BaseRepository<Valuation> {
  findByVehicleId(vehicleId: string): Promise<Valuation[]>;
  findLatestByVehicleId(vehicleId: string): Promise<Valuation | null>;
  findBySource(source: string): Promise<Valuation[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Valuation[]>;
  findWithPagination(pagination: PaginationOptions): Promise<PaginatedResponse<Valuation>>;
}