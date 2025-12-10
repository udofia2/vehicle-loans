import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { LoanApplication } from '../entities/loan-application.entity';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';
import { LoanApplicationStatus } from '../../../common/enums';

export interface LoanApplicationRepository extends BaseRepository<LoanApplication> {
  findByVehicleId(vehicleId: string): Promise<LoanApplication[]>;
  findByStatus(status: LoanApplicationStatus): Promise<LoanApplication[]>;
  findByValuationId(valuationId: string): Promise<LoanApplication[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<LoanApplication[]>;
  findWithPagination(pagination: PaginationOptions): Promise<PaginatedResponse<LoanApplication>>;
  updateStatus(id: string, status: LoanApplicationStatus): Promise<LoanApplication>;
}