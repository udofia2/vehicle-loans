import { IsNotEmpty, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VehicleCondition } from '../../../common/enums';

export class GenerateValuationDto {
  @ApiProperty({
    description: 'Vehicle ID for valuation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({
    description: 'Current vehicle mileage',
    example: 25000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiProperty({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @IsNotEmpty()
  @IsEnum(VehicleCondition)
  condition: VehicleCondition;
}
