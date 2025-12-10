import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { OfferRepository } from '../interfaces/offer-repository.interface';
import { OfferStatus } from '../../../common/enums';
import { PaginatedResponse, PaginationOptions } from '../../../common/types';
import { createPaginatedResponse } from '../../../common/dto/response.dto';

@Injectable()
export class TypeOrmOfferRepository implements OfferRepository {
  constructor(
    @InjectRepository(Offer)
    private readonly repository: Repository<Offer>,
  ) {}

  async create(offerData: Partial<Offer>): Promise<Offer> {
    const offer = this.repository.create(offerData);
    return await this.repository.save(offer);
  }

  async findById(id: string): Promise<Offer | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'loanApplication',
        'loanApplication.vehicle',
        'loanApplication.valuation',
      ],
    });
  }

  async findByLoanApplicationId(loanApplicationId: string): Promise<Offer[]> {
    return await this.repository.find({
      where: { loanApplicationId },
      relations: ['loanApplication'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByLoanApplicationId(
    loanApplicationId: string,
  ): Promise<Offer[]> {
    return await this.repository.find({
      where: {
        loanApplicationId,
        status: OfferStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
      relations: ['loanApplication'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Offer>): Promise<Offer> {
    await this.repository.update(id, updateData);
    const updatedOffer = await this.findById(id);
    if (!updatedOffer) {
      throw new Error(`Offer with ID ${id} not found after update`);
    }
    return updatedOffer;
  }

  async updateStatus(
    id: string,
    status: OfferStatus,
    acceptedAt?: Date,
  ): Promise<Offer> {
    const updateData: Partial<Offer> = { status };
    if (acceptedAt) {
      updateData.acceptedAt = acceptedAt;
    }
    return await this.update(id, updateData);
  }

  async findExpiredOffers(): Promise<Offer[]> {
    return await this.repository.find({
      where: {
        status: OfferStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
      relations: ['loanApplication'],
    });
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Offer>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options || {};

    const [offers, total] = await this.repository.findAndCount({
      relations: ['loanApplication'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(offers, total, page, limit);
  }

  async findByStatus(
    status: OfferStatus,
    options?: PaginationOptions,
  ): Promise<PaginatedResponse<Offer>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options || {};

    const [offers, total] = await this.repository.findAndCount({
      where: { status },
      relations: ['loanApplication'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(offers, total, page, limit);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  async countByLoanApplicationId(loanApplicationId: string): Promise<number> {
    return await this.repository.count({
      where: { loanApplicationId },
    });
  }
}
