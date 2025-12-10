import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TypeOrmOfferRepository } from '../repositories/offer.repository';
import { LoanApplicationService } from '../../loan/services/loan-application.service';
import { Offer } from '../entities/offer.entity';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferStatusDto } from '../dto/update-offer-status.dto';
import { OfferStatus, LoanApplicationStatus } from '../../../common/enums';
import { LoanCalculatorUtil } from '../../../common/utils/loan-calculator.util';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';

@Injectable()
export class OfferService {
  constructor(
    private readonly offerRepository: TypeOrmOfferRepository,
    private readonly loanApplicationService: LoanApplicationService,
  ) {}

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    // Validate that loan application exists and is approved
    const loanApplication =
      await this.loanApplicationService.validateLoanApplicationExists(
        createOfferDto.loanApplicationId,
      );

    if (loanApplication.status !== LoanApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Can only create offers for approved loan applications',
      );
    }

    // Check if there are already active offers for this loan application
    const existingActiveOffers =
      await this.offerRepository.findActiveByLoanApplicationId(
        createOfferDto.loanApplicationId,
      );

    if (existingActiveOffers.length > 0) {
      throw new ConflictException('Loan application already has active offers');
    }

    // Calculate offer details
    const offeredAmount =
      createOfferDto.offeredAmount ||
      this.calculateOfferedAmount(loanApplication.loanAmount);

    const loanTerm = createOfferDto.loanTerm || loanApplication.termMonths;

    const loanCalculation = LoanCalculatorUtil.calculateLoanPayment(
      offeredAmount,
      createOfferDto.interestRate,
      loanTerm,
    );

    // Set expiration date (default 7 days from now)
    const expirationHours = createOfferDto.expirationHours || 168; // 7 days
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const offerData: Partial<Offer> = {
      loanApplicationId: createOfferDto.loanApplicationId,
      offeredAmount,
      interestRate: createOfferDto.interestRate,
      loanTerm,
      monthlyPayment: loanCalculation.monthlyPayment,
      totalPayable: loanCalculation.totalPayment,
      status: OfferStatus.ACTIVE,
      expiresAt,
      acceptedAt: null,
    };

    return await this.offerRepository.create(offerData);
  }

  async getOfferById(id: string): Promise<Offer> {
    const offer = await this.offerRepository.findById(id);
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }
    return offer;
  }

  async getOffersByLoanApplicationId(
    loanApplicationId: string,
  ): Promise<Offer[]> {
    // Validate that loan application exists
    await this.loanApplicationService.validateLoanApplicationExists(
      loanApplicationId,
    );

    return await this.offerRepository.findByLoanApplicationId(
      loanApplicationId,
    );
  }

  async getAllOffers(
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Offer>> {
    return await this.offerRepository.findAll(options);
  }

  async getOffersByStatus(
    status: OfferStatus,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Offer>> {
    return await this.offerRepository.findByStatus(status, options);
  }

  async updateOfferStatus(
    id: string,
    updateStatusDto: UpdateOfferStatusDto,
  ): Promise<Offer> {
    const offer = await this.getOfferById(id);

    // Validate status transition
    this.validateStatusTransition(offer.status, updateStatusDto.status);

    const acceptedAt =
      updateStatusDto.status === OfferStatus.ACCEPTED ? new Date() : undefined;

    return await this.offerRepository.updateStatus(
      id,
      updateStatusDto.status,
      acceptedAt,
    );
  }

  async acceptOffer(id: string): Promise<Offer> {
    return await this.updateOfferStatus(id, { status: OfferStatus.ACCEPTED });
  }

  async declineOffer(id: string): Promise<Offer> {
    return await this.updateOfferStatus(id, { status: OfferStatus.DECLINED });
  }

  async expireOldOffers(): Promise<number> {
    const expiredOffers = await this.offerRepository.findExpiredOffers();
    let expiredCount = 0;

    for (const offer of expiredOffers) {
      await this.offerRepository.updateStatus(offer.id, OfferStatus.EXPIRED);
      expiredCount++;
    }

    return expiredCount;
  }

  async deleteOffer(id: string): Promise<boolean> {
    const offer = await this.getOfferById(id);

    if (offer.status === OfferStatus.ACCEPTED) {
      throw new BadRequestException('Cannot delete accepted offers');
    }

    return await this.offerRepository.delete(id);
  }

  private calculateOfferedAmount(requestedAmount: number): number {
    // Business logic: Offer 80-90% of requested amount based on risk assessment
    const offerPercentage = 0.85; // 85% of requested amount
    return Math.round(requestedAmount * offerPercentage);
  }

  private validateStatusTransition(
    currentStatus: OfferStatus,
    newStatus: OfferStatus,
  ): void {
    const validTransitions: Record<OfferStatus, OfferStatus[]> = {
      [OfferStatus.ACTIVE]: [
        OfferStatus.ACCEPTED,
        OfferStatus.DECLINED,
        OfferStatus.EXPIRED,
      ],
      [OfferStatus.ACCEPTED]: [], // No transitions allowed from accepted
      [OfferStatus.DECLINED]: [], // No transitions allowed from declined
      [OfferStatus.EXPIRED]: [], // No transitions allowed from expired
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  // Helper method for loan application service
  async validateOfferExists(id: string): Promise<Offer> {
    return await this.getOfferById(id);
  }
}
