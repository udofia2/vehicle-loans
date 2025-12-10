import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { VehicleRepository } from '../interfaces/vehicle-repository.interface';
import {
  VehicleSearchCriteria,
  PaginatedResponse,
  PaginationOptions,
} from '../../../common/types';
import { createPaginatedResponse } from '../../../common/dto/response.dto';

@Injectable()
export class TypeOrmVehicleRepository implements VehicleRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
  ) {}

  async create(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.repository.create(vehicleData);
    return await this.repository.save(vehicle);
  }

  async findById(id: string): Promise<Vehicle | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByVin(vin: string): Promise<Vehicle | null> {
    return await this.repository.findOne({ where: { vin } });
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    await this.repository.update(id, updateData);
    const updatedVehicle = await this.findById(id);
    if (!updatedVehicle) {
      throw new Error(`Vehicle with ID ${id} not found`);
    }
    return updatedVehicle;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findByMakeAndModel(make: string, model: string): Promise<Vehicle[]> {
    return await this.repository.find({
      where: { make, model },
      order: { year: 'DESC' },
    });
  }

  async findByYearRange(minYear: number, maxYear: number): Promise<Vehicle[]> {
    return await this.repository
      .createQueryBuilder('vehicle')
      .where('vehicle.year >= :minYear AND vehicle.year <= :maxYear', {
        minYear,
        maxYear,
      })
      .orderBy('vehicle.year', 'DESC')
      .getMany();
  }

  async searchVehicles(
    criteria: VehicleSearchCriteria,
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<Vehicle>> {
    const queryBuilder = this.createSearchQueryBuilder(criteria);

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    // Apply sorting
    if (pagination.sortBy) {
      const order = pagination.sortOrder || 'ASC';
      queryBuilder.orderBy(`vehicle.${pagination.sortBy}`, order);
    } else {
      queryBuilder.orderBy('vehicle.createdAt', 'DESC');
    }

    const [vehicles, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResponse(vehicles, total, page, limit);
  }

  private createSearchQueryBuilder(
    criteria: VehicleSearchCriteria,
  ): SelectQueryBuilder<Vehicle> {
    const queryBuilder = this.repository.createQueryBuilder('vehicle');

    if (criteria.make) {
      queryBuilder.andWhere('LOWER(vehicle.make) LIKE LOWER(:make)', {
        make: `%${criteria.make}%`,
      });
    }

    if (criteria.model) {
      queryBuilder.andWhere('LOWER(vehicle.model) LIKE LOWER(:model)', {
        model: `%${criteria.model}%`,
      });
    }

    if (criteria.year) {
      queryBuilder.andWhere('vehicle.year = :year', { year: criteria.year });
    }

    if (criteria.yearRange) {
      queryBuilder.andWhere(
        'vehicle.year >= :minYear AND vehicle.year <= :maxYear',
        {
          minYear: criteria.yearRange.min,
          maxYear: criteria.yearRange.max,
        },
      );
    }

    if (criteria.mileageRange) {
      queryBuilder.andWhere(
        'vehicle.mileage >= :minMileage AND vehicle.mileage <= :maxMileage',
        {
          minMileage: criteria.mileageRange.min,
          maxMileage: criteria.mileageRange.max,
        },
      );
    }

    if (criteria.condition) {
      queryBuilder.andWhere('vehicle.condition = :condition', {
        condition: criteria.condition,
      });
    }

    if (criteria.transmission) {
      queryBuilder.andWhere('vehicle.transmission = :transmission', {
        transmission: criteria.transmission,
      });
    }

    if (criteria.fuelType) {
      queryBuilder.andWhere('vehicle.fuelType = :fuelType', {
        fuelType: criteria.fuelType,
      });
    }

    if (criteria.color) {
      queryBuilder.andWhere('LOWER(vehicle.color) LIKE LOWER(:color)', {
        color: `%${criteria.color}%`,
      });
    }

    return queryBuilder;
  }
}

export { TypeOrmVehicleRepository as VehicleRepository };