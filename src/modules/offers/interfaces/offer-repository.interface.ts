import { Offer } from '../entities/offer.entity';
import { OfferStatus } from '../../../common/enums';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';

export interface OfferRepository {
  create(offerData: Partial<Offer>): Promise<Offer>;
  findById(id: string): Promise<Offer | null>;
  findByLoanApplicationId(loanApplicationId: string): Promise<Offer[]>;
  findActiveByLoanApplicationId(loanApplicationId: string): Promise<Offer[]>;
  update(id: string, updateData: Partial<Offer>): Promise<Offer>;
  updateStatus(
    id: string,
    status: OfferStatus,
    acceptedAt?: Date,
  ): Promise<Offer>;
  findExpiredOffers(): Promise<Offer[]>;
  findAll(options?: PaginationOptions): Promise<PaginatedResponse<Offer>>;
  findByStatus(
    status: OfferStatus,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Offer>>;
  delete(id: string): Promise<boolean>;
  countByLoanApplicationId(loanApplicationId: string): Promise<number>;
}
