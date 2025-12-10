import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LoanApplication } from '../entities/loan-application.entity';
import { LoanApplicationRepository } from '../interfaces/loan-application-repository.interface';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';
import { LoanApplicationStatus } from '../../../common/enums';
import { createPaginatedResponse } from '../../../common/dto/response.dto';

@Injectable()
export class TypeOrmLoanApplicationRepository implements LoanApplicationRepository {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly repository: Repository<LoanApplication>,
  ) {}

  async create(loanData: Partial<LoanApplication>): Promise<LoanApplication> {
    const loan = this.repository.create(loanData);
    return await this.repository.save(loan);
  }

  async findById(id: string): Promise<LoanApplication | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['vehicle', 'valuation'],
    });
  }

  async findAll(): Promise<LoanApplication[]> {
    return await this.repository.find({
      relations: ['vehicle', 'valuation'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<LoanApplication>): Promise<LoanApplication> {
    await this.repository.update(id, updateData);
    const updatedLoan = await this.findById(id);
    if (!updatedLoan) {
      throw new Error(`Loan application with ID ${id} not found`);
    }
    return updatedLoan;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findByVehicleId(vehicleId: string): Promise<LoanApplication[]> {
    return await this.repository.find({
      where: { vehicleId },
      relations: ['valuation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: LoanApplicationStatus): Promise<LoanApplication[]> {
    return await this.repository.find({
      where: { status },
      relations: ['vehicle', 'valuation'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByValuationId(valuationId: string): Promise<LoanApplication[]> {
    return await this.repository.find({
      where: { valuationId },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<LoanApplication[]> {
    return await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['vehicle', 'valuation'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: LoanApplicationStatus): Promise<LoanApplication> {
    return await this.update(id, { status });
  }

  async findWithPagination(
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<LoanApplication>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.vehicle', 'vehicle')
      .leftJoinAndSelect('loan.valuation', 'valuation')
      .skip(skip)
      .take(limit);

    if (pagination.sortBy) {
      const order = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`loan.${pagination.sortBy}`, order);
    } else {
      queryBuilder.orderBy('loan.createdAt', 'DESC');
    }

    const [loans, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(loans, total, page, limit);
  }
}

export { TypeOrmLoanApplicationRepository as LoanApplicationRepository };