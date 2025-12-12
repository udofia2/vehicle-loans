import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { VehicleRepository } from '../interfaces/vehicle-repository.interface';
import { TypeOrmVehicleRepository } from '../repositories/vehicle.repository';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { SearchVehicleDto } from '../dto/search-vehicle.dto';
import { VinValidatorUtil } from '../../../common/utils/vin-validator.util';
import { VinLookupService } from './vin-lookup.service';
import { TransmissionType, FuelType } from '../../../common/enums';
import {
  VehicleSearchCriteria,
  PaginatedResponse,
  PaginationOptions,
} from '../../../common/types';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    private readonly vehicleRepository: TypeOrmVehicleRepository,
    private readonly vinLookupService: VinLookupService,
  ) {}

  async createVehicle(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Validate VIN format first
    const vinValidation = VinValidatorUtil.validateVin(createVehicleDto.vin);
    if (!vinValidation.isValid) {
      throw new BadRequestException(
        `VIN Validation Error: ${vinValidation.reason}`,
      );
    }

    // Check if VIN already exists
    const existingVehicle = await this.vehicleRepository.findByVin(
      createVehicleDto.vin,
    );
    if (existingVehicle) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    // Try to decode VIN and enrich vehicle data
    let enrichedData = { ...createVehicleDto };

    try {
      this.logger.log(`Attempting VIN lookup for: ${createVehicleDto.vin}`);
      const vinData = await this.vinLookupService.lookupVin(
        createVehicleDto.vin,
      );

      if (vinData.isValid) {
        // Use VIN data to fill missing fields or validate provided data
        enrichedData = {
          ...createVehicleDto,
          make: createVehicleDto.make || vinData.make,
          model: createVehicleDto.model || vinData.model,
          year: createVehicleDto.year || vinData.year,
          transmission:
            createVehicleDto.transmission ||
            this.mapTransmissionType(vinData.transmission),
          fuelType:
            createVehicleDto.fuelType || this.mapFuelType(vinData.fuelType),
          color:
            createVehicleDto.color || vinData.color || createVehicleDto.color,
        };

        // Log any discrepancies between provided and VIN data
        this.logVinDiscrepancies(createVehicleDto, vinData);
      } else {
        this.logger.warn(
          `VIN lookup returned invalid data for: ${createVehicleDto.vin}`,
          vinData.errors,
        );
      }
    } catch (error) {
      this.logger.warn(
        `VIN lookup failed for: ${createVehicleDto.vin}`,
        error.message,
      );
      // Continue with provided data if VIN lookup fails
    }

    return await this.vehicleRepository.create(enrichedData);
  }

  /**
   * Create vehicle manually without VIN lookup
   */
  async createVehicleManually(
    createVehicleDto: CreateVehicleDto,
  ): Promise<Vehicle> {
    const vinValidation = VinValidatorUtil.validateVin(createVehicleDto.vin);
    if (!vinValidation.isValid) {
      throw new BadRequestException(
        `VIN Validation Error: ${vinValidation.reason}`,
      );
    }

    // Check if vehicle with this VIN already exists
    const existingVehicle = await this.vehicleRepository.findByVin(
      createVehicleDto.vin,
    );
    if (existingVehicle) {
      throw new ConflictException('Vehicle with this VIN already exists');
    }

    this.logger.log(
      `Creating vehicle manually for VIN: ${createVehicleDto.vin}`,
    );

    // Create vehicle directly from provided data without VIN lookup
    return await this.vehicleRepository.create(createVehicleDto);
  }

  private logVinDiscrepancies(
    providedData: CreateVehicleDto,
    vinData: any,
  ): void {
    if (
      providedData.make &&
      providedData.make.toLowerCase() !== vinData.make.toLowerCase()
    ) {
      this.logger.warn(
        `VIN suggests make: ${vinData.make}, but provided: ${providedData.make}`,
      );
    }
    if (
      providedData.model &&
      providedData.model.toLowerCase() !== vinData.model.toLowerCase()
    ) {
      this.logger.warn(
        `VIN suggests model: ${vinData.model}, but provided: ${providedData.model}`,
      );
    }
    if (providedData.year && providedData.year !== vinData.year) {
      this.logger.warn(
        `VIN suggests year: ${vinData.year}, but provided: ${providedData.year}`,
      );
    }
  }

  /**
   * Decode VIN and return vehicle information without saving
   */
  async decodeVin(vin: string) {
    const vinValidation = VinValidatorUtil.validateVin(vin);
    if (!vinValidation.isValid) {
      throw new BadRequestException(
        `VIN Validation Error: ${vinValidation.reason}`,
      );
    }

    try {
      return await this.vinLookupService.lookupVin(vin);
    } catch (error) {
      this.logger.error(`VIN decode failed for: ${vin}`, error.message);
      throw error;
    }
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

  async updateVehicle(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);

    // If VIN is being updated, validate it
    if (updateVehicleDto.vin && updateVehicleDto.vin !== vehicle.vin) {
      const vinValidation = VinValidatorUtil.validateVin(updateVehicleDto.vin);
      if (!vinValidation.isValid) {
        throw new BadRequestException(
          `VIN Validation Error: ${vinValidation.reason}`,
        );
      }

      // Check if new VIN already exists
      const existingVehicle = await this.vehicleRepository.findByVin(
        updateVehicleDto.vin,
      );
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

  async searchVehicles(
    searchDto: SearchVehicleDto,
  ): Promise<PaginatedResponse<Vehicle>> {
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
    if (
      searchDto.mileageMin !== undefined ||
      searchDto.mileageMax !== undefined
    ) {
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

  async getVehiclesByMakeAndModel(
    make: string,
    model: string,
  ): Promise<Vehicle[]> {
    return await this.vehicleRepository.findByMakeAndModel(make, model);
  }

  async getVehiclesByYearRange(
    minYear: number,
    maxYear: number,
  ): Promise<Vehicle[]> {
    return await this.vehicleRepository.findByYearRange(minYear, maxYear);
  }

  async getVehicleCount(): Promise<number> {
    return await this.vehicleRepository.count();
  }

  async validateVehicleExists(id: string): Promise<Vehicle> {
    return await this.getVehicleById(id);
  }

  /**
   * Map external API transmission type to our enum
   */
  private mapTransmissionType(externalType: string): TransmissionType {
    if (!externalType) return TransmissionType.AUTOMATIC; // Default

    const lowercaseType = externalType.toLowerCase();

    if (lowercaseType.includes('manual') || lowercaseType.includes('stick')) {
      return TransmissionType.MANUAL;
    }
    if (lowercaseType.includes('cvt')) {
      return TransmissionType.CVT;
    }
    if (lowercaseType.includes('semi') || lowercaseType.includes('paddle')) {
      return TransmissionType.SEMI_AUTOMATIC;
    }

    // Default to automatic for any unclear transmissions
    return TransmissionType.AUTOMATIC;
  }

  /**
   * Map external API fuel type to our enum
   */
  private mapFuelType(externalType: string): FuelType {
    if (!externalType) return FuelType.GASOLINE; // Default

    const lowercaseType = externalType.toLowerCase();

    if (lowercaseType.includes('diesel')) {
      return FuelType.DIESEL;
    }
    if (
      lowercaseType.includes('electric') &&
      !lowercaseType.includes('hybrid')
    ) {
      return FuelType.ELECTRIC;
    }
    if (lowercaseType.includes('plugin') || lowercaseType.includes('plug-in')) {
      return FuelType.PLUGIN_HYBRID;
    }
    if (lowercaseType.includes('hybrid')) {
      return FuelType.HYBRID;
    }
    if (
      lowercaseType.includes('hydrogen') ||
      lowercaseType.includes('fuel cell')
    ) {
      return FuelType.HYDROGEN;
    }

    // Default to gasoline for any unclear fuel types
    return FuelType.GASOLINE;
  }
}
