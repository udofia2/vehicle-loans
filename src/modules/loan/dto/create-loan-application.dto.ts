import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoanApplicationStatus } from '../../../common/enums';

export class CreateLoanApplicationDto {
  @ApiProperty({
    description: 'Vehicle ID for loan application',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Valuation ID for loan application',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  valuationId: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 20000.00,
    minimum: 1000,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1000)
  loanAmount: number;

  @ApiProperty({
    description: 'Interest rate (percentage)',
    example: 5.25,
    minimum: 0,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 60,
    minimum: 12,
    maximum: 84,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(12)
  termMonths: number;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}