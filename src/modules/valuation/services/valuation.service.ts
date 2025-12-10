import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TypeOrmValuationRepository } from '../repositories/valuation.repository';
import { VehicleService } from '../../vehicle/services/vehicle.service';
import { ValuationApiService } from './valuation-api.service';
import { Valuation } from '../entities/valuation.entity';
import { CreateValuationDto } from '../dto/create-valuation.dto';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';
import { VehicleCondition, ValuationSource } from '../../../common/enums';

@Injectable()
export class ValuationService {
  private readonly logger = new Logger(ValuationService.name);

  constructor(
    private readonly valuationRepository: TypeOrmValuationRepository,
    private readonly vehicleService: VehicleService,
    private readonly valuationApiService: ValuationApiService,
  ) {}

  async createValuation(
    createValuationDto: CreateValuationDto,
  ): Promise<Valuation> {
    // Validate that the vehicle exists
    const vehicle = await this.vehicleService.validateVehicleExists(
      createValuationDto.vehicleId,
    );

    // Validate valuation values
    this.validateValuationValues(
      createValuationDto.estimatedValue,
      createValuationDto.minValue,
      createValuationDto.maxValue,
    );

    return await this.valuationRepository.create(createValuationDto);
  }

  /**
   * Generate valuation using external API
   */
  async generateValuationFromApi(
    vehicleId: string,
    mileage: number,
    condition: VehicleCondition,
  ): Promise<Valuation> {
    // Validate that the vehicle exists and get vehicle data
    const vehicle = await this.vehicleService.validateVehicleExists(vehicleId);

    this.logger.log(
      `Generating valuation for vehicle ${vehicleId} using external API`,
    );

    try {
      // Map our condition enum to external API format
      const apiCondition = this.mapConditionToApiFormat(condition);

      // Get valuation from external API
      const valuationData = await this.valuationApiService.getValuation({
        vin: vehicle.vin,
        mileage,
        condition,
      });

      // Create valuation record
      const createValuationDto: CreateValuationDto = {
        vehicleId,
        estimatedValue: valuationData.estimatedValue,
        minValue: valuationData.tradeInValue,
        maxValue: valuationData.retailValue,
        source: ValuationSource.EXTERNAL_API,
        metadata: {
          lastUpdated: new Date(valuationData.lastUpdated),
          marketTrends: {
            priceDirection: 'stable' as const,
            confidence: valuationData.confidence,
          },
        },
      };

      const valuation =
        await this.valuationRepository.create(createValuationDto);

      this.logger.log(
        `Valuation created successfully for vehicle ${vehicleId}: $${valuationData.estimatedValue}`,
      );

      return valuation;
    } catch (error) {
      this.logger.error(
        `External valuation generation failed for vehicle ${vehicleId}:`,
        error.message,
      );
      throw error;
    }
  }

  async getValuationById(id: string): Promise<Valuation> {
    const valuation = await this.valuationRepository.findById(id);
    if (!valuation) {
      throw new NotFoundException(`Valuation with ID ${id} not found`);
    }
    return valuation;
  }

  async getAllValuations(): Promise<Valuation[]> {
    return await this.valuationRepository.findAll();
  }

  async getValuationsByVehicleId(vehicleId: string): Promise<Valuation[]> {
    // Validate that the vehicle exists
    await this.vehicleService.validateVehicleExists(vehicleId);

    return await this.valuationRepository.findByVehicleId(vehicleId);
  }

  async getLatestValuationByVehicleId(
    vehicleId: string,
  ): Promise<Valuation | null> {
    // Validate that the vehicle exists
    await this.vehicleService.validateVehicleExists(vehicleId);

    return await this.valuationRepository.findLatestByVehicleId(vehicleId);
  }

  async getValuationsBySource(source: string): Promise<Valuation[]> {
    return await this.valuationRepository.findBySource(source);
  }

  async getValuationsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Valuation[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    return await this.valuationRepository.findByDateRange(startDate, endDate);
  }

  async getValuationsWithPagination(
    pagination: PaginationOptions,
  ): Promise<PaginatedResponse<Valuation>> {
    return await this.valuationRepository.findWithPagination(pagination);
  }

  async deleteValuation(id: string): Promise<void> {
    const valuation = await this.getValuationById(id);
    await this.valuationRepository.delete(id);
  }

  async getValuationCount(): Promise<number> {
    return await this.valuationRepository.count();
  }

  async validateValuationExists(id: string): Promise<Valuation> {
    return await this.getValuationById(id);
  }

  private validateValuationValues(
    estimatedValue: number,
    minValue: number,
    maxValue: number,
  ): void {
    if (minValue > estimatedValue) {
      throw new Error('Minimum value cannot be greater than estimated value');
    }

    if (estimatedValue > maxValue) {
      throw new Error('Estimated value cannot be greater than maximum value');
    }

    if (minValue > maxValue) {
      throw new Error('Minimum value cannot be greater than maximum value');
    }

    if (minValue < 0 || estimatedValue < 0 || maxValue < 0) {
      throw new Error('Valuation values must be positive');
    }
  }

  /**
   * Map our VehicleCondition enum to external API format
   */
  private mapConditionToApiFormat(
    condition: VehicleCondition,
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    switch (condition) {
      case VehicleCondition.EXCELLENT:
        return 'excellent';
      case VehicleCondition.GOOD:
        return 'good';
      case VehicleCondition.FAIR:
        return 'fair';
      case VehicleCondition.POOR:
        return 'poor';
      default:
        return 'good'; // Default fallback
    }
  }
}
