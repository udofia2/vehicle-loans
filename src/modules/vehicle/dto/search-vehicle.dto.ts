import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VehicleCondition, TransmissionType, FuelType } from '../../../common/enums';

export class SearchVehicleDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Vehicle make/manufacturer',
    example: 'Toyota',
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: 'Vehicle model',
    example: 'Camry',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Vehicle year',
    example: 2020,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({
    description: 'Minimum year',
    example: 2015,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1900)
  yearMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum year',
    example: 2025,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(2030)
  yearMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum mileage',
    example: 10000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mileageMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum mileage',
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mileageMax?: number;

  @ApiPropertyOptional({
    description: 'Vehicle condition',
    enum: VehicleCondition,
  })
  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @ApiPropertyOptional({
    description: 'Transmission type',
    enum: TransmissionType,
  })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({
    description: 'Fuel type',
    enum: FuelType,
  })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({
    description: 'Vehicle color',
    example: 'Blue',
  })
  @IsOptional()
  @IsString()
  color?: string;
}