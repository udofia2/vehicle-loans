import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './services/vehicle.service';
import { VehicleRepository } from './repositories/vehicle.repository';
import { VehicleController } from './controllers/vehicle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleService, VehicleRepository],
  exports: [VehicleService, VehicleRepository],
})
export class VehicleModule {}
