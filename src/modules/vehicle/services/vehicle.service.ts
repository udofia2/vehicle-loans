import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { VehicleRepository } from '../interfaces/vehicle-repository.interface';
import { TypeOrmVehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { SearchVehicleDto } from '../dto/search-vehicle.dto';
import { VinValidatorUtil } from '../../../common/utils/vin-validator.util';
import {
  VehicleSearchCriteria,
  PaginatedResponse,
  PaginationOptions,
} from '../../../common/types';

@Injectable()
export class VehicleService {
  constructor(private readonly vehicleRepository: TypeOrmVehicleRepository) {}

  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Validate VIN
    const vinValidation = VinValidatorUtil.validateVin(createVehicleDto.vin);
    if (!vinValidation.isValid) {
      throw new ConflictException(`Invalid VIN: ${vinValidation.reason}`);
    }

    // Check if VIN already exists
    const existingVehicle = await this.vehicleRepository.findByVin(createVehicleDto.vin);
    if (existingVehicle) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    // Auto-populate manufacturer from VIN if not provided or different
    const vinManufacturer = VinValidatorUtil.getManufacturerFromVin(createVehicleDto.vin);
    if (vinManufacturer && vinManufacturer.toLowerCase() !== createVehicleDto.make.toLowerCase()) {
      console.warn(`VIN suggests manufacturer: ${vinManufacturer}, but provided: ${createVehicleDto.make}`);
    }

    // Auto-populate year from VIN if not provided or different
    const vinYear = VinValidatorUtil.getModelYearFromVin(createVehicleDto.vin);
    if (vinYear && vinYear !== createVehicleDto.year) {
      console.warn(`VIN suggests year: ${vinYear}, but provided: ${createVehicleDto.year}`);
    }

    return await this.vehicleRepository.create(createVehicleDto);
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async getVehicleByVin(vin: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findByVin(vin);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with VIN ${vin} not found`);
    }
    return vehicle;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.vehicleRepository.findAll();
  }

  async updateVehicle(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);

    // If VIN is being updated, validate it
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const vinValidation = VinValidatorUtil.validateVin(updateVehicleDto.vin);
      if (!vinValidation.isValid) {
        throw new ConflictException(`Invalid VIN: ${vinValidation.reason}`);
      }

      // Check if new VIN already exists
      const existingVehicle = await this.vehicleRepository.findByVin(updateVehicleDto.vin);
      if (existingVehicle && existingVehicle.id !== id) {
        throw new ConflictException('Vehicle with this VIN already exists');
      }
    }

    return await this.vehicleRepository.update(id, updateVehicleDto);
  }

  async deleteVehicle(id: string): Promise<void> {
    const vehicle = await this.getVehicleById(id);
    await this.vehicleRepository.delete(id);
  }

  async searchVehicles(searchDto: SearchVehicleDto): Promise<PaginatedResponse<Vehicle>> {
    const criteria: VehicleSearchCriteria = {
      make: searchDto.make,
      model: searchDto.model,
      year: searchDto.year,
      condition: searchDto.condition,
      transmission: searchDto.transmission,
      fuelType: searchDto.fuelType,
      color: searchDto.color,
    };

    // Handle year range
    if (searchDto.yearMin || searchDto.yearMax) {
      criteria.yearRange = {
        min: searchDto.yearMin || 1900,
        max: searchDto.yearMax || new Date().getFullYear() + 1,
      };
    }

    // Handle mileage range
    if (searchDto.mileageMin !== undefined || searchDto.mileageMax !== undefined) {
      criteria.mileageRange = {
        min: searchDto.mileageMin || 0,
        max: searchDto.mileageMax || Number.MAX_SAFE_INTEGER,
      };
    }

    const pagination: PaginationOptions = {
      page: searchDto.page,
      limit: searchDto.limit,
      sortBy: searchDto.sortBy,
      sortOrder: searchDto.sortOrder,
    };

    return await this.vehicleRepository.searchVehicles(criteria, pagination);
  }

  async getVehiclesByMakeAndModel(make: string, model: string): Promise<Vehicle[]> {
    return await this.vehicleRepository.findByMakeAndModel(make, model);
  }

  async getVehiclesByYearRange(minYear: number, maxYear: number): Promise<Vehicle[]> {
    return await this.vehicleRepository.findByYearRange(minYear, maxYear);
  }

  async getVehicleCount(): Promise<number> {
    return await this.vehicleRepository.count();
  }

  async validateVehicleExists(id: string): Promise<Vehicle> {
    return await this.getVehicleById(id);
  }
}