import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { validationSchema } from './config/validation.schema';
import configuration from './config/configuration';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ValuationModule } from './modules/valuation/valuation.module';
import { LoanModule } from './modules/loan/loan.module';
import { OfferModule } from './modules/offers/offer.module';

@Module({
  imports: [
    // Global Configuration Module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.development', '.env.local', '.env'],
      validationSchema,
      validationOptions: {
        allowUnknown: true, // Allow unknown environment variables
        abortEarly: false,
      },
    }),

    // Database Module
    DatabaseModule,

    // Common Module (global filters, interceptors, pipes)
    CommonModule,

    // Feature Modules
    VehicleModule,
    ValuationModule,
    LoanModule,
    OfferModule,
  ],
})
export class AppModule {}
