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
  ParseEnumPipe,
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
import { LoanApplicationService } from '../services/loan-application.service';
import { LoanApplication } from '../entities/loan-application.entity';
import { CreateLoanApplicationDto } from '../dto/create-loan-application.dto';
import { UpdateLoanApplicationDto } from '../dto/update-loan-application.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { LoanApplicationStatus } from '../../../common/enums';
import { LoanCalculation } from '../../../common/types';
import { ApiResponseDto, PaginatedResponseDto } from '../../../common/dto/response.dto';

@ApiTags('loans')
@Controller('loan-applications')
export class LoanApplicationController {
  constructor(private readonly loanService: LoanApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan application' })
  @ApiResponse({
    status: 201,
    description: 'Loan application created successfully',
    type: LoanApplication,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or loan criteria not met' })
  async createLoanApplication(@Body() createLoanDto: CreateLoanApplicationDto): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.createLoanApplication(createLoanDto);
    return new ApiResponseDto(true, loan, 'Loan application created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all loan applications with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplication],
  })
  async getAllLoanApplications(@Query() paginationDto: PaginationDto): Promise<ApiResponseDto<PaginatedResponseDto<LoanApplication>>> {
    const result = await this.loanService.getLoanApplicationsWithPagination(paginationDto);
    return new ApiResponseDto(true, result, 'Loan applications retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan application by ID' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan application retrieved successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async getLoanApplicationById(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.getLoanApplicationById(id);
    return new ApiResponseDto(true, loan, 'Loan application retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update loan application by ID' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan application updated successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async updateLoanApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLoanDto: UpdateLoanApplicationDto,
  ): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.updateLoanApplication(id, updateLoanDto);
    return new ApiResponseDto(true, loan, 'Loan application updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete loan application by ID' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Loan application deleted successfully' })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async deleteLoanApplication(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.loanService.deleteLoanApplication(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update loan application status' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiQuery({ name: 'status', description: 'New status', enum: LoanApplicationStatus })
  @ApiResponse({
    status: 200,
    description: 'Loan application status updated successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async updateLoanStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status', new ParseEnumPipe(LoanApplicationStatus)) status: LoanApplicationStatus,
  ): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.updateLoanStatus(id, status);
    return new ApiResponseDto(true, loan, 'Loan application status updated successfully');
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve loan application' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan application approved successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async approveLoanApplication(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.approveLoanApplication(id);
    return new ApiResponseDto(true, loan, 'Loan application approved successfully');
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject loan application' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan application rejected successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async rejectLoanApplication(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.rejectLoanApplication(id);
    return new ApiResponseDto(true, loan, 'Loan application rejected successfully');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel loan application' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan application cancelled successfully',
    type: LoanApplication,
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  @ApiBadRequestResponse({ description: 'Cannot cancel approved loan application' })
  async cancelLoanApplication(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanApplication>> {
    const loan = await this.loanService.cancelLoanApplication(id);
    return new ApiResponseDto(true, loan, 'Loan application cancelled successfully');
  }

  @Get('vehicle/:vehicleId')
  @ApiOperation({ summary: 'Get loan applications by vehicle ID' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplication],
  })
  @ApiNotFoundResponse({ description: 'Vehicle not found' })
  async getLoanApplicationsByVehicleId(@Param('vehicleId', ParseUUIDPipe) vehicleId: string): Promise<ApiResponseDto<LoanApplication[]>> {
    const loans = await this.loanService.getLoanApplicationsByVehicleId(vehicleId);
    return new ApiResponseDto(true, loans, 'Loan applications retrieved successfully');
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get loan applications by status' })
  @ApiParam({ name: 'status', description: 'Loan application status', enum: LoanApplicationStatus })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplication],
  })
  async getLoanApplicationsByStatus(
    @Param('status', new ParseEnumPipe(LoanApplicationStatus)) status: LoanApplicationStatus,
  ): Promise<ApiResponseDto<LoanApplication[]>> {
    const loans = await this.loanService.getLoanApplicationsByStatus(status);
    return new ApiResponseDto(true, loans, 'Loan applications retrieved successfully');
  }

  @Get('valuation/:valuationId')
  @ApiOperation({ summary: 'Get loan applications by valuation ID' })
  @ApiParam({ name: 'valuationId', description: 'Valuation ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplication],
  })
  @ApiNotFoundResponse({ description: 'Valuation not found' })
  async getLoanApplicationsByValuationId(@Param('valuationId', ParseUUIDPipe) valuationId: string): Promise<ApiResponseDto<LoanApplication[]>> {
    const loans = await this.loanService.getLoanApplicationsByValuationId(valuationId);
    return new ApiResponseDto(true, loans, 'Loan applications retrieved successfully');
  }

  @Get('search/date-range')
  @ApiOperation({ summary: 'Get loan applications by date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (ISO string)', type: 'string' })
  @ApiQuery({ name: 'endDate', description: 'End date (ISO string)', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan applications retrieved successfully',
    type: [LoanApplication],
  })
  @ApiBadRequestResponse({ description: 'Invalid date format or range' })
  async getLoanApplicationsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<ApiResponseDto<LoanApplication[]>> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format. Please use ISO date string.');
    }
    
    const loans = await this.loanService.getLoanApplicationsByDateRange(start, end);
    return new ApiResponseDto(true, loans, 'Loan applications retrieved successfully');
  }

  @Get(':id/calculate-payment')
  @ApiOperation({ summary: 'Calculate loan payment details' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Loan payment calculated successfully',
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async calculateLoanPayment(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanCalculation>> {
    const calculation = await this.loanService.calculateLoanPayment(id);
    return new ApiResponseDto(true, calculation, 'Loan payment calculated successfully');
  }

  @Get(':id/payment-schedule')
  @ApiOperation({ summary: 'Generate loan payment schedule' })
  @ApiParam({ name: 'id', description: 'Loan application ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Payment schedule generated successfully',
  })
  @ApiNotFoundResponse({ description: 'Loan application not found' })
  async generatePaymentSchedule(@Param('id', ParseUUIDPipe) id: string): Promise<ApiResponseDto<LoanCalculation>> {
    const schedule = await this.loanService.generatePaymentSchedule(id);
    return new ApiResponseDto(true, schedule, 'Payment schedule generated successfully');
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Get total loan application count' })
  @ApiResponse({
    status: 200,
    description: 'Loan application count retrieved successfully',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getLoanApplicationCount(): Promise<ApiResponseDto<{ count: number }>> {
    const count = await this.loanService.getLoanApplicationCount();
    return new ApiResponseDto(true, { count }, 'Loan application count retrieved successfully');
  }
}