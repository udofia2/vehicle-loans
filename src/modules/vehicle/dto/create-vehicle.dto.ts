import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Length,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleCondition, TransmissionType, FuelType } from '../../../common/enums';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Vehicle Identification Number (VIN)',
    example: '1HGBH41JXMN109186',
    minLength: 17,
    maxLength: 17,
  })
  @IsNotEmpty()
  @IsString()
  @Length(17, 17)
  @Matches(/^[A-HJ-NPR-Z0-9]{17}$/, {
    message: 'VIN must be 17 characters long and contain only valid characters',
  })
  vin: string;

  @ApiProperty({
    description: 'Vehicle make/manufacturer',
    example: 'Toyota',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  model: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2020,
    minimum: 1900,
    maximum: 2030,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: 'Vehicle mileage',
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

  @ApiProperty({
    description: 'Transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @IsNotEmpty()
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @ApiProperty({
    description: 'Fuel type',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  @IsNotEmpty()
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Blue',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  color: string;
}