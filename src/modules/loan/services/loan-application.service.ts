import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TypeOrmLoanApplicationRepository } from '../repositories/loan-application.repository';
import { VehicleService } from '../../vehicle/services/vehicle.service';
import { ValuationService } from '../../valuation/services/valuation.service';
import { LoanApplication } from '../entities/loan-application.entity';
import { CreateLoanApplicationDto } from '../dto/create-loan-application.dto';
import { UpdateLoanApplicationDto } from '../dto/update-loan-application.dto';
import { LoanApplicationStatus } from '../../../common/enums';
import { LoanCalculatorUtil } from '../../../common/utils/loan-calculator.util';
import { LoanCalculation, PaginatedResponse, PaginationOptions } from '../../../common/types';

@Injectable()
export class LoanApplicationService {
  constructor(
    private readonly loanRepository: TypeOrmLoanApplicationRepository,
    private readonly vehicleService: VehicleService,
    private readonly valuationService: ValuationService,
  ) {}

  async createLoanApplication(
    createLoanDto: CreateLoanApplicationDto,
  ): Promise<LoanApplication> {
    // Validate that the vehicle exists
    const vehicle = await this.vehicleService.validateVehicleExists(
      createLoanDto.vehicleId,
    );

    // Validate that the valuation exists
    const valuation = await this.valuationService.validateValuationExists(
      createLoanDto.valuationId,
    );

    // Validate that the valuation belongs to the vehicle
    if (valuation.vehicleId !== createLoanDto.vehicleId) {
      throw new BadRequestException(
        'Valuation does not belong to the specified vehicle',
      );
    }

    // Validate loan criteria
    const loanValidation = LoanCalculatorUtil.validateLoanCriteria(
      createLoanDto.loanAmount,
      valuation.estimatedValue,
    );

    if (!loanValidation.isValid) {
      throw new BadRequestException(loanValidation.reason);
    }

    // Validate loan term
    this.validateLoanTerms(createLoanDto.interestRate, createLoanDto.termMonths);

    return await this.loanRepository.create({
      ...createLoanDto,
      status: LoanApplicationStatus.PENDING,
    });
  }

  async getLoanApplicationById(id: string): Promise<LoanApplication> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundException(`Loan application with ID ${id} not found`);
    }
    return loan;
  }

  async getAllLoanApplications(): Promise<LoanApplication[]> {
    return await this.loanRepository.findAll();
  }

  async updateLoanApplication(
    id: string,
    updateLoanDto: UpdateLoanApplicationDto,
  ): Promise<LoanApplication> {
    const loan = await this.getLoanApplicationById(id);

    // If updating loan amount, validate against current valuation
    if (updateLoanDto.loanAmount && updateLoanDto.loanAmount !== loan.loanAmount) {
      const valuation = await this.valuationService.getValuationById(loan.valuationId);
      const loanValidation = LoanCalculatorUtil.validateLoanCriteria(
        updateLoanDto.loanAmount,
        valuation.estimatedValue,
      );

      if (!loanValidation.isValid) {
        throw new BadRequestException(loanValidation.reason);
      }
    }

    // Validate loan terms if updating
    if (updateLoanDto.interestRate || updateLoanDto.termMonths) {
      this.validateLoanTerms(
        updateLoanDto.interestRate || loan.interestRate,
        updateLoanDto.termMonths || loan.termMonths,
      );
    }

    return await this.loanRepository.update(id, updateLoanDto);
  }

  async updateLoanStatus(
    id: string,
    status: LoanApplicationStatus,
  ): Promise<LoanApplication> {
    const loan = await this.getLoanApplicationById(id);
    return await this.loanRepository.updateStatus(id, status);
  }

  async deleteLoanApplication(id: string): Promise<void> {
    const loan = await this.getLoanApplicationById(id);
    await this.loanRepository.delete(id);
  }

  async getLoanApplicationsByVehicleId(vehicleId: string): Promise<LoanApplication[]> {
    // Validate that the vehicle exists
    await this.vehicleService.validateVehicleExists(vehicleId);
    
    return await this.loanRepository.findByVehicleId(vehicleId);
  }

  async getLoanApplicationsByStatus(
    status: LoanApplicationStatus,
  ): Promise<LoanApplication[]> {
    return await this.loanRepository.findByStatus(status);
  }

  async getLoanApplicationsByValuationId(valuationId: string): Promise<LoanApplication[]> {
    // Validate that the valuation exists
    await this.valuationService.validateValuationExists(valuationId);
    
    return await this.loanRepository.findByValuationId(valuationId);
  }

  async getLoanApplicationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<LoanApplication[]> {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    return await this.loanRepository.findByDateRange(startDate, endDate);
  }

  async getLoanApplicationsWithPagination(
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<LoanApplication>> {
    return await this.loanRepository.findWithPagination(pagination);
  }

  async calculateLoanPayment(id: string): Promise<LoanCalculation> {
    const loan = await this.getLoanApplicationById(id);
    
    return LoanCalculatorUtil.calculateLoanPayment(
      loan.loanAmount,
      loan.interestRate,
      loan.termMonths,
    );
  }

  async generatePaymentSchedule(id: string): Promise<LoanCalculation> {
    const loan = await this.getLoanApplicationById(id);
    
    return LoanCalculatorUtil.generatePaymentSchedule(
      loan.loanAmount,
      loan.interestRate,
      loan.termMonths,
    );
  }

  async getLoanApplicationCount(): Promise<number> {
    return await this.loanRepository.count();
  }

  async approveLoanApplication(id: string): Promise<LoanApplication> {
    return await this.updateLoanStatus(id, LoanApplicationStatus.APPROVED);
  }

  async rejectLoanApplication(id: string): Promise<LoanApplication> {
    return await this.updateLoanStatus(id, LoanApplicationStatus.REJECTED);
  }

  async cancelLoanApplication(id: string): Promise<LoanApplication> {
    const loan = await this.getLoanApplicationById(id);
    
    if (loan.status === LoanApplicationStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel an approved loan application');
    }
    
    return await this.updateLoanStatus(id, LoanApplicationStatus.CANCELLED);
  }

  private validateLoanTerms(interestRate: number, termMonths: number): void {
    if (interestRate < 0 || interestRate > 50) {
      throw new BadRequestException('Interest rate must be between 0% and 50%');
    }

    if (termMonths < 12 || termMonths > 84) {
      throw new BadRequestException('Loan term must be between 12 and 84 months');
    }
  }
}