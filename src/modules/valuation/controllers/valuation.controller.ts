import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ValuationService } from '../services/valuation.service';
import { Valuation } from '../entities/valuation.entity';
import { CreateValuationDto } from '../dto/create-valuation.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiResponseDto, PaginatedResponseDto } from '../../../common/dto/response.dto';

@ApiTags('valuations')
@Controller('valuations')
export class ValuationController {
  constructor(private readonly valuationService: ValuationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new valuation' })
  @ApiResponse({
    status: 201,
    description: 'Valuation created successfully',
    type: Valuation,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async createValuation(@Body() createValuationDto: CreateValuationDto): Promise<ApiResponseDto<Valuation>> {
    const valuation = await this.valuationService.createValuation(createValuationDto);
    return new ApiResponseDto(true, valuation, 'Valuation created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all valuations with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Valuations retrieved successfully',
    type: [Valuation],
  })
  async getAllValuations(@Query() paginationDto: PaginationDto): Promise<ApiResponseDto<PaginatedResponseDto<Valuation>>> {
    const result = await this.valuationService.getValuationsWithPagination(paginationDto);
    return new ApiResponseDto(true, result, 'Valuations retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get valuation by ID' })
  @ApiParam({ name: 'id', description: 'Valuation ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Valuation retrieved successfully',
    type: Valuation,
  })
  @ApiNotFoundResponse({ description: 'Valuation not found' })
  async getValuationById(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<Valuation>> {
    const valuation = await this.valuationService.getValuationById(id);
    return new ApiResponseDto(true, valuation, 'Valuation retrieved successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete valuation by ID' })
  @ApiParam({ name: 'id', description: 'Valuation ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Valuation deleted successfully' })
  @ApiNotFoundResponse({ description: 'Valuation not found' })
  async deleteValuation(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.valuationService.deleteValuation(id);
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get all valuations for a vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Valuations retrieved successfully',
    type: [Valuation],
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async getValuationsByVehicleId(@Param('vehicleId', ParseUUIDPipe) vehicleId: string): Promise<ApiResponseDto<Valuation[]>> {
    const valuations = await this.valuationService.getValuationsByVehicleId(vehicleId);
    return new ApiResponseDto(true, valuations, 'Valuations retrieved successfully');
  }

  @Get('vehicle/:vehicleId/latest')
  @ApiOperation({ summary: 'Get latest valuation for a vehicle' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Latest valuation retrieved successfully',
    type: Valuation,
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found or no valuations exist' })
  async getLatestValuationByVehicleId(@Param('vehicleId', ParseUUIDPipe) vehicleId: string): Promise<ApiResponseDto<Valuation | null>> {
    const valuation = await this.valuationService.getLatestValuationByVehicleId(vehicleId);
    return new ApiResponseDto(true, valuation, 'Latest valuation retrieved successfully');
  }

  @Get('search/source')
  @ApiOperation({ summary: 'Get valuations by source' })
  @ApiQuery({ name: 'source', description: 'Valuation source', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Valuations retrieved successfully',
    type: [Valuation],
  })
  async getValuationsBySource(@Query('source') source: string): Promise<ApiResponseDto<Valuation[]>> {
    const valuations = await this.valuationService.getValuationsBySource(source);
    return new ApiResponseDto(true, valuations, 'Valuations retrieved successfully');
  }

  @Get('search/date-range')
  @ApiOperation({ summary: 'Get valuations by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)', type: 'string' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Valuations retrieved successfully',
    type: [Valuation],
  })
  @ApiBadRequestResponse({ description: 'Invalid date format or range' })
  async getValuationsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ApiResponseDto<Valuation[]>> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Please use ISO date string.');
    }
    
    const valuations = await this.valuationService.getValuationsByDateRange(start, end);
    return new ApiResponseDto(true, valuations, 'Valuations retrieved successfully');
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Get total valuation count' })
  @ApiResponse({
    status: 200,
    description: 'Valuation count retrieved successfully',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getValuationCount(): Promise<ApiResponseDto<{ count: number }>> {
    const count = await this.valuationService.getValuationCount();
    return new ApiResponseDto(true, { count }, 'Valuation count retrieved successfully');
  }
}