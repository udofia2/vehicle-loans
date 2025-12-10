import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferController } from './controllers/offer.controller';
import { OfferService } from './services/offer.service';
import { TypeOrmOfferRepository } from './repositories/offer.repository';
import { LoanModule } from '../loan/loan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer]),
    LoanModule, // Import to access LoanApplicationService
  ],
  controllers: [OfferController],
  providers: [OfferService, TypeOrmOfferRepository],
  exports: [OfferService, TypeOrmOfferRepository],
})
export class OfferModule {}
