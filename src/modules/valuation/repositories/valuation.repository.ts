import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Valuation } from '../entities/valuation.entity';
import { ValuationRepository } from '../interfaces/valuation-repository.interface';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';
import { createPaginatedResponse } from '../../../common/dto/response.dto';

@Injectable()
export class TypeOrmValuationRepository implements ValuationRepository {
  constructor(
    @InjectRepository(Valuation)
    private readonly repository: Repository<Valuation>,
  ) {}

  async create(valuationData: Partial<Valuation>): Promise<Valuation> {
    const valuation = this.repository.create(valuationData);
    return await this.repository.save(valuation);
  }

  async findById(id: string): Promise<Valuation | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['vehicle'],
    });
  }

  async findAll(): Promise<Valuation[]> {
    return await this.repository.find({
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Valuation>): Promise<Valuation> {
    await this.repository.update(id, updateData);
    const updatedValuation = await this.findById(id);
    if (!updatedValuation) {
      throw new Error(`Valuation with ID ${id} not found`);
    }
    return updatedValuation;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findByVehicleId(vehicleId: string): Promise<Valuation[]> {
    return await this.repository.find({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByVehicleId(vehicleId: string): Promise<Valuation | null> {
    return await this.repository.findOne({
      where: { vehicleId },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySource(source: string): Promise<Valuation[]> {
    return await this.repository.find({
      where: { source: source as any },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Valuation[]> {
    return await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
    });
  }

  async findWithPagination(
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<Valuation>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('valuation')
      .leftJoinAndSelect('valuation.vehicle', 'vehicle')
      .skip(skip)
      .take(limit);

    if (pagination.sortBy) {
      const order = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`valuation.${pagination.sortBy}`, order);
    } else {
      queryBuilder.orderBy('valuation.createdAt', 'DESC');
    }

    const [valuations, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(valuations, total, page, limit);
  }
}

export { TypeOrmValuationRepository as ValuationRepository };