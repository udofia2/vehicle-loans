import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, retry } from 'rxjs';
import { VinLookupResponse } from '../interfaces/vin-lookup-response.interface';

@Injectable()
export class VinLookupService {
  private readonly logger = new Logger(VinLookupService.name);
  private readonly rapidApiKey: string;
  private readonly rapidApiHost = 'vin-lookup2.p.rapidapi.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rapidApiKey = this.configService.get<string>('RAPIDAPI_KEY');

    if (!this.rapidApiKey) {
      this.logger.error('RAPIDAPI_KEY is not configured');
      throw new Error('VIN lookup service is not properly configured');
    }
  }

  async lookupVin(vin: string): Promise<VinLookupResponse> {
    this.logger.log(`Looking up VIN: ${vin}`);

    // Validate VIN format
    if (!this.isValidVinFormat(vin)) {
      throw new HttpException(
        'Invalid VIN format. VIN must be 17 characters long and contain only valid characters.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const url = `https://${this.rapidApiHost}/vehicle-lookup`;
      const headers = {
        'x-rapidapi-host': this.rapidApiHost,
        'x-rapidapi-key': this.rapidApiKey,
      };

      this.logger.debug(`Making request to: ${url} with VIN: ${vin}`);

      const response = await firstValueFrom(
        this.httpService
          .get(url, {
            params: { vin },
            headers,
            timeout: 15000, // 15 second timeout for reliability
          })
          .pipe(
            timeout(15000),
            retry({ count: 1, delay: 2000 }), // Single retry with 2s delay
          ),
      );

      this.logger.log(`VIN lookup successful for ${vin}`);
      return this.mapApiResponseToVinData(response.data, vin);
    } catch (error) {
      this.logger.error(`VIN lookup failed for ${vin}:`, error.message);

      // Handle specific HTTP status codes
      if (error.response?.status === 429) {
        throw new HttpException(
          'Rate limit exceeded. You have exhausted your VIN lookup quota. Please wait and try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new HttpException(
          'VIN lookup service authentication failed. Please contact support to verify API credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          'Invalid VIN provided. Please verify the VIN format and try again.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.response?.status === 404) {
        throw new HttpException(
          'VIN not found in database. The provided VIN may not exist or may not be in our records.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
        throw new HttpException(
          'VIN lookup service is currently experiencing delays. Please try again in a few moments.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'VIN lookup service is currently unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // For any other errors, provide a generic service unavailable message
      throw new HttpException(
        'VIN lookup service encountered an error. Please try again later or contact support if the problem persists.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private isValidVinFormat(vin: string): boolean {
    // VIN should be 17 characters, alphanumeric, no I, O, or Q
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
    return vinRegex.test(vin.toUpperCase());
  }

  private mapApiResponseToVinData(
    apiData: any,
    vin: string,
  ): VinLookupResponse {
    // Map the RapidAPI response to our interface
    return {
      vin: vin.toUpperCase(),
      make: apiData.make || 'Unknown',
      model: apiData.model || 'Unknown',
      year: parseInt(apiData.year) || new Date().getFullYear(),
      trim: apiData.trim,
      engine: apiData.engine,
      transmission: apiData.transmission,
      drivetrain: apiData.drivetrain,
      bodyStyle: apiData.bodyStyle || apiData.body_style,
      fuelType: apiData.fuelType || apiData.fuel_type,
      color: apiData.color,
      country: apiData.country,
      manufacturer: apiData.manufacturer,
      vehicleType: apiData.vehicleType || apiData.vehicle_type,
      displacement: apiData.displacement,
      cylinders: apiData.cylinders ? parseInt(apiData.cylinders) : undefined,
      isValid: true,
      errors: [],
    };
  }
}
