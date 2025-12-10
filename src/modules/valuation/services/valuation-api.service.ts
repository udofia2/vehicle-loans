import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, retry } from 'rxjs';
import { VehicleCondition } from '../../../common/enums';
import {
  ValuationApiResponse,
  ValuationApiRequest,
} from '../interfaces/valuation-api-response.interface';

@Injectable()
export class ValuationApiService {
  private readonly logger = new Logger(ValuationApiService.name);
  private readonly rapidApiKey: string;
  private readonly rapidApiHost = 'car-api2.p.rapidapi.com'; // Assuming this is the valuation API host

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.rapidApiKey = this.configService.get<string>('RAPIDAPI_KEY');

    if (!this.rapidApiKey) {
      this.logger.error('RAPIDAPI_KEY is not configured');
      throw new Error('Valuation API service is not properly configured');
    }
  }

  async getValuation(
    request: ValuationApiRequest,
  ): Promise<ValuationApiResponse> {
    this.logger.log(
      `Getting valuation for VIN: ${request.vin}, mileage: ${request.mileage}, condition: ${request.condition}`,
    );

    try {
      const url = `https://${this.rapidApiHost}/valuation`;
      const headers = {
        'x-rapidapi-host': this.rapidApiHost,
        'x-rapidapi-key': this.rapidApiKey,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService
          .post(
            url,
            {
              vin: request.vin,
              mileage: request.mileage,
              condition: this.mapConditionToApiFormat(request.condition),
            },
            {
              headers,
              timeout: 15000, // 15 second timeout for reliability
            },
          )
          .pipe(
            timeout(15000),
            retry({ count: 1, delay: 2000 }), // Single retry with 2s delay
          ),
      );

      this.logger.log(`Valuation API success for VIN: ${request.vin}`);
      return this.mapApiResponseToValuation(response.data, request);
    } catch (error) {
      this.logger.error(
        `Valuation API failed for ${request.vin}:`,
        error.message,
      );

      // Handle specific HTTP status codes
      if (error.response?.status === 429) {
        throw new HttpException(
          'Rate limit exceeded. You have exhausted your valuation API quota. Please wait and try again later.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new HttpException(
          'Valuation API authentication failed. Please contact support to verify API credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (error.response?.status === 400) {
        throw new HttpException(
          'Invalid request data provided to valuation API. Please check the VIN, mileage, and condition values.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error.response?.status === 404) {
        throw new HttpException(
          'Valuation data not found for the provided vehicle information.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
        throw new HttpException(
          'Valuation API is currently experiencing delays. Please try again in a few moments.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Valuation API is currently unavailable. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // For any other errors, provide a generic service unavailable message
      throw new HttpException(
        'Valuation API encountered an error. Please try again later or contact support if the problem persists.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private mapApiResponseToValuation(
    apiData: any,
    request: ValuationApiRequest,
  ): ValuationApiResponse {
    // Convert USD values to NGN (assuming API returns USD)
    const usdToNgnRate = 1500; // Approximate exchange rate

    return {
      vin: request.vin.toUpperCase(),
      make: apiData.make || 'Unknown',
      model: apiData.model || 'Unknown',
      year: parseInt(apiData.year) || new Date().getFullYear(),
      mileage: request.mileage,
      condition: request.condition,
      estimatedValue: Math.round(
        (parseFloat(apiData.estimatedValue) || 0) * usdToNgnRate,
      ),
      marketValue: Math.round(
        (parseFloat(apiData.marketValue) || 0) * usdToNgnRate,
      ),
      tradeInValue: Math.round(
        (parseFloat(apiData.tradeInValue) ||
          parseFloat(apiData.trade_in_value) ||
          0) * usdToNgnRate,
      ),
      retailValue: Math.round(
        (parseFloat(apiData.retailValue) ||
          parseFloat(apiData.retail_value) ||
          0) * usdToNgnRate,
      ),
      currency: 'NGN',
      confidence: parseFloat(apiData.confidence) || 0.85,
      lastUpdated: new Date().toISOString(),
      factors: apiData.factors || {
        mileage: request.mileage > 100000 ? 0.1 : 0.05,
        condition: this.getConditionDepreciation(request.condition),
        market: 0.05,
      },
    };
  }

  private mapConditionToApiFormat(condition: VehicleCondition): string {
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
        return 'good';
    }
  }

  private getConditionDepreciation(condition: VehicleCondition): number {
    switch (condition) {
      case VehicleCondition.EXCELLENT:
        return 0;
      case VehicleCondition.GOOD:
        return 0.1;
      case VehicleCondition.FAIR:
        return 0.25;
      case VehicleCondition.POOR:
        return 0.4;
      default:
        return 0.15;
    }
  }
}
