import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Vehicle } from '../modules/vehicle/entities/vehicle.entity';
import { Valuation } from '../modules/valuation/entities/valuation.entity';
import { LoanApplication } from '../modules/loan/entities/loan-application.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isTest = this.configService.get('NODE_ENV') === 'test';

    const baseConfig: TypeOrmModuleOptions = {
      type: this.configService.get('DB_TYPE', 'sqlite') as 'sqlite',
      database: this.configService.get('DB_DATABASE', ':memory:') as string,
      entities: [Vehicle, Valuation, LoanApplication],
      synchronize: this.configService.get('DB_SYNCHRONIZE', true),
      dropSchema: !isProduction, // Only drop schema in non-production
      logging: this.configService.get('DB_LOGGING', true) && !isTest,
      autoLoadEntities: true,
    };

    // Add SQLite specific options if using SQLite
    if (this.configService.get('DB_TYPE') === 'sqlite') {
      return {
        ...baseConfig,
        enableWAL: false, // Disable WAL mode for in-memory
        busyTimeout: 10000, // 10 second timeout
      } as TypeOrmModuleOptions;
    }

    return baseConfig;
  }
}
