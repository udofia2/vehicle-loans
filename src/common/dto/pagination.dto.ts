import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { APP_CONSTANTS } from '../constants/app.constants';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: APP_CONSTANTS.MIN_PAGE_SIZE,
    maximum: APP_CONSTANTS.MAX_PAGE_SIZE,
    default: APP_CONSTANTS.DEFAULT_PAGE_SIZE,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(APP_CONSTANTS.MIN_PAGE_SIZE, {
    message: `Limit must be at least ${APP_CONSTANTS.MIN_PAGE_SIZE}`,
  })
  @Max(APP_CONSTANTS.MAX_PAGE_SIZE, {
    message: `Limit cannot exceed ${APP_CONSTANTS.MAX_PAGE_SIZE}`,
  })
  limit?: number = APP_CONSTANTS.DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  // Computed properties
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }
}
