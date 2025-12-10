import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Valuation } from './entities/valuation.entity';
import { ValuationService } from './services/valuation.service';
import { ValuationRepository } from './repositories/valuation.repository';
import { ValuationController } from './controllers/valuation.controller';
import { ValuationApiService } from './services/valuation-api.service';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Valuation]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    VehicleModule,
  ],
  controllers: [ValuationController],
  providers: [ValuationService, ValuationRepository, ValuationApiService],
  exports: [ValuationService, ValuationRepository],
})
export class ValuationModule {}
