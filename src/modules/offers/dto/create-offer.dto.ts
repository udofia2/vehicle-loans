import {
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
  Max,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Loan application ID for the offer',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsNotEmpty()
  @IsUUID()
  loanApplicationId: string;

  @ApiProperty({
    description: 'Interest rate percentage (5-30%)',
    example: 15.5,
    minimum: 5,
    maximum: 30,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5)
  @Max(30)
  interestRate: number;

  @ApiPropertyOptional({
    description:
      'Custom loan term in months (default calculated from loan application)',
    example: 36,
    minimum: 12,
    maximum: 84,
  })
  @IsOptional()
  @IsInt()
  @Min(12)
  @Max(84)
  loanTerm?: number;

  @ApiPropertyOptional({
    description: 'Custom offered amount (default calculated from valuation)',
    example: 5000000.0,
    minimum: 100000,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(100000)
  offeredAmount?: number;

  @ApiPropertyOptional({
    description: 'Offer expiration hours from now (default 7 days)',
    example: 168,
    minimum: 24,
    maximum: 720,
  })
  @IsOptional()
  @IsInt()
  @Min(24)
  @Max(720)
  expirationHours?: number;
}
