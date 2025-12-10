import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValuationSource } from '../../../common/enums';
import { ValuationMetadata } from '../../../common/types';

export class CreateValuationDto {
  @ApiProperty({
    description: 'Vehicle ID for valuation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Estimated vehicle value',
    example: 25000.50,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedValue: number;

  @ApiProperty({
    description: 'Minimum estimated value',
    example: 23000.00,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minValue: number;

  @ApiProperty({
    description: 'Maximum estimated value',
    example: 27000.00,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  maxValue: number;

  @ApiProperty({
    description: 'Valuation source',
    enum: ValuationSource,
    example: ValuationSource.EXTERNAL_API,
  })
  @IsNotEmpty()
  @IsEnum(ValuationSource)
  source: ValuationSource;

  @ApiPropertyOptional({
    description: 'Additional valuation metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: ValuationMetadata;
}