import {
  Controller,
  Get,
  Post,
  Put,
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
import { VehicleService } from '../services/vehicle.service';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { SearchVehicleDto } from '../dto/search-vehicle.dto';
import {
  ApiResponseDto,
  PaginatedResponseDto,
} from '../../../common/dto/response.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: Vehicle,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async createVehicle(
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<ApiResponseDto<Vehicle>> {
    const vehicle = await this.vehicleService.createVehicle(createVehicleDto);
    return new ApiResponseDto(true, vehicle, 'Vehicle created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles or search vehicles' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
    type: [Vehicle],
  })
  async getVehicles(
    @Query() searchDto: SearchVehicleDto,
  ): Promise<ApiResponseDto<PaginatedResponseDto<Vehicle>>> {
    // If any search parameters are provided, use search; otherwise get all
    const hasSearchParams = Object.keys(searchDto).some(
      (key) =>
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        searchDto[key as keyof SearchVehicleDto] !== undefined,
    );

    if (hasSearchParams) {
      const result = await this.vehicleService.searchVehicles(searchDto);
      return new ApiResponseDto(true, result, 'Vehicles searched successfully');
    } else {
      const vehicles = await this.vehicleService.getAllVehicles();
      const paginatedResult = new PaginatedResponseDto(
        vehicles,
        vehicles.length,
        1,
        vehicles.length,
      );
      return new ApiResponseDto(
        true,
        paginatedResult,
        'Vehicles retrieved successfully',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: Vehicle,
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async getVehicleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseDto<Vehicle>> {
    const vehicle = await this.vehicleService.getVehicleById(id);
    return new ApiResponseDto(true, vehicle, 'Vehicle retrieved successfully');
  }

  @Get('vin/:vin')
  @ApiOperation({ summary: 'Get vehicle by VIN' })
  @ApiParam({ name: 'vin', description: 'Vehicle VIN', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
    type: Vehicle,
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async getVehicleByVin(
    @Param('vin') vin: string,
  ): Promise<ApiResponseDto<Vehicle>> {
    const vehicle = await this.vehicleService.getVehicleByVin(vin);
    return new ApiResponseDto(true, vehicle, 'Vehicle retrieved successfully');
  }

  @Get('decode/:vin')
  @ApiOperation({ summary: 'Decode VIN to get vehicle information' })
  @ApiParam({
    name: 'vin',
    description: 'Vehicle VIN to decode',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'VIN decoded successfully',
    schema: {
      type: 'object',
      properties: {
        vin: { type: 'string' },
        make: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'number' },
        isValid: { type: 'boolean' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid VIN format' })
  async decodeVin(@Param('vin') vin: string): Promise<ApiResponseDto<any>> {
    const vinData = await this.vehicleService.decodeVin(vin);
    return new ApiResponseDto(true, vinData, 'VIN decoded successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: Vehicle,
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<ApiResponseDto<Vehicle>> {
    const vehicle = await this.vehicleService.updateVehicle(
      id,
      updateVehicleDto,
    );
    return new ApiResponseDto(true, vehicle, 'Vehicle updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete vehicle by ID' })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async deleteVehicle(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.vehicleService.deleteVehicle(id);
  }

  @Get('search/make-model')
  @ApiOperation({ summary: 'Get vehicles by make and model' })
  @ApiQuery({ name: 'make', description: 'Vehicle make', type: 'string' })
  @ApiQuery({ name: 'model', description: 'Vehicle model', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
    type: [Vehicle],
  })
  async getVehiclesByMakeAndModel(
    @Query('make') make: string,
    @Query('model') model: string,
  ): Promise<ApiResponseDto<Vehicle[]>> {
    const vehicles = await this.vehicleService.getVehiclesByMakeAndModel(
      make,
      model,
    );
    return new ApiResponseDto(
      true,
      vehicles,
      'Vehicles retrieved successfully',
    );
  }

  @Get('search/year-range')
  @ApiOperation({ summary: 'Get vehicles by year range' })
  @ApiQuery({ name: 'minYear', description: 'Minimum year', type: 'number' })
  @ApiQuery({ name: 'maxYear', description: 'Maximum year', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
    type: [Vehicle],
  })
  async getVehiclesByYearRange(
    @Query('minYear') minYear: number,
    @Query('maxYear') maxYear: number,
  ): Promise<ApiResponseDto<Vehicle[]>> {
    const vehicles = await this.vehicleService.getVehiclesByYearRange(
      minYear,
      maxYear,
    );
    return new ApiResponseDto(
      true,
      vehicles,
      'Vehicles retrieved successfully',
    );
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Get total vehicle count' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle count retrieved successfully',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getVehicleCount(): Promise<ApiResponseDto<{ count: number }>> {
    const count = await this.vehicleService.getVehicleCount();
    return new ApiResponseDto(
      true,
      { count },
      'Vehicle count retrieved successfully',
    );
  }
}
