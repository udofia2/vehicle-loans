import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './services/vehicle.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { VehicleController } from './controllers/vehicle.controller';
import { VinLookupService } from './services/vin-lookup.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository, VinLookupService],
  exports: [VehicleService, VehicleRepository],
})
export class VehicleModule {}
