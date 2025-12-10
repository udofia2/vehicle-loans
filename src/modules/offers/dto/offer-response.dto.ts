import { ApiProperty } from '@nestjs/swagger';
import { OfferStatus } from '../../../common/enums';
import { Offer } from '../entities/offer.entity';

export class OfferResponseDto {
  @ApiProperty({
    description: 'Offer unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Loan application ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  loanApplicationId: string;

  @ApiProperty({
    description: 'Amount bank is willing to lend',
    example: 5000000.0,
  })
  offeredAmount: number;

  @ApiProperty({
    description: 'Interest rate percentage',
    example: 15.5,
  })
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 36,
  })
  loanTerm: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 173611.0,
  })
  monthlyPayment: number;

  @ApiProperty({
    description: 'Total amount payable',
    example: 6250000.0,
  })
  totalPayable: number;

  @ApiProperty({
    description: 'Offer status',
    enum: OfferStatus,
    example: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  @ApiProperty({
    description: 'Offer expiration timestamp',
    example: '2025-12-16T10:00:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'When offer was accepted (nullable)',
    example: null,
    required: false,
  })
  acceptedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-12-10T06:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-12-10T06:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(offer: Offer): OfferResponseDto {
    const response = new OfferResponseDto();
    response.id = offer.id;
    response.loanApplicationId = offer.loanApplicationId;
    response.offeredAmount = offer.offeredAmount;
    response.interestRate = offer.interestRate;
    response.loanTerm = offer.loanTerm;
    response.monthlyPayment = offer.monthlyPayment;
    response.totalPayable = offer.totalPayable;
    response.status = offer.status;
    response.expiresAt = offer.expiresAt;
    response.acceptedAt = offer.acceptedAt;
    response.createdAt = offer.createdAt;
    response.updatedAt = offer.updatedAt;
    return response;
  }

  static fromEntities(offers: Offer[]): OfferResponseDto[] {
    return offers.map((offer) => this.fromEntity(offer));
  }
}
