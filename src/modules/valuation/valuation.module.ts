import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Valuation } from './entities/valuation.entity';
import { ValuationService } from './services/valuation.service';
import { ValuationRepository } from './repositories/valuation.repository';
import { ValuationController } from './controllers/valuation.controller';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Valuation]),
    VehicleModule,
  ],
  controllers: [ValuationController],
  providers: [ValuationService, ValuationRepository],
  exports: [ValuationService, ValuationRepository],
})
export class ValuationModule {}
