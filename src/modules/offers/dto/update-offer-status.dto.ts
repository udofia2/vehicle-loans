import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '../../../common/enums';

export class UpdateOfferStatusDto {
  @ApiProperty({
    description: 'New offer status',
    enum: OfferStatus,
    example: OfferStatus.ACCEPTED,
  })
  @IsNotEmpty()
  @IsEnum(OfferStatus)
  status: OfferStatus;

  @ApiPropertyOptional({
    description: 'Optional notes for status change',
    example: 'Customer accepted the offer via mobile app',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
