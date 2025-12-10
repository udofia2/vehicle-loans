import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Vehicle } from '../modules/vehicle/entities/vehicle.entity';
import { Valuation } from '../modules/valuation/entities/valuation.entity';
import { LoanApplication } from '../modules/loan/entities/loan-application.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: ':memory:', // In-memory SQLite database
      entities: [Vehicle, Valuation, LoanApplication],
      synchronize: true, // Auto-sync schema (only for development/demo)
      dropSchema: true, // Drop schema on startup to avoid index conflicts
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
    };
  }
}
