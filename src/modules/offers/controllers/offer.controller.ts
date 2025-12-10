import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OfferService } from '../services/offer.service';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferStatusDto } from '../dto/update-offer-status.dto';
import { OfferResponseDto } from '../dto/offer-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { OfferStatus } from '../../../common/enums';

@ApiTags('offers')
@ApiBearerAuth()
@Controller('offers')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @ApiOperation({ summary: 'Generate offer for approved loan application' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Offer created successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or loan application not approved',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Active offers already exist for this loan application',
  })
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerService.createOffer(createOfferDto);
    return OfferResponseDto.fromEntity(offer);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offers with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offers retrieved successfully',
  })
  async getAllOffers(@Query() paginationDto: PaginationDto) {
    const result = await this.offerService.getAllOffers(paginationDto);
    return {
      ...result,
      data: OfferResponseDto.fromEntities(result.data),
    };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get offers by status' })
  @ApiParam({ name: 'status', enum: OfferStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offers retrieved successfully',
  })
  async getOffersByStatus(
    @Param('status') status: OfferStatus,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.offerService.getOffersByStatus(
      status,
      paginationDto,
    );
    return {
      ...result,
      data: OfferResponseDto.fromEntities(result.data),
    };
  }

  @Get('loan/:loanApplicationId')
  @ApiOperation({ summary: 'Get all offers for a loan application' })
  @ApiParam({ name: 'loanApplicationId', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offers retrieved successfully',
    type: [OfferResponseDto],
  })
  async getOffersByLoanApplicationId(
    @Param('loanApplicationId', ParseUUIDPipe) loanApplicationId: string,
  ): Promise<OfferResponseDto[]> {
    const offers =
      await this.offerService.getOffersByLoanApplicationId(loanApplicationId);
    return OfferResponseDto.fromEntities(offers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer retrieved successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Offer not found',
  })
  async getOfferById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerService.getOfferById(id);
    return OfferResponseDto.fromEntity(offer);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update offer status' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer status updated successfully',
    type: OfferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  async updateOfferStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateOfferStatusDto,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerService.updateOfferStatus(
      id,
      updateStatusDto,
    );
    return OfferResponseDto.fromEntity(offer);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept an offer' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer accepted successfully',
    type: OfferResponseDto,
  })
  async acceptOffer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerService.acceptOffer(id);
    return OfferResponseDto.fromEntity(offer);
  }

  @Patch(':id/decline')
  @ApiOperation({ summary: 'Decline an offer' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer declined successfully',
    type: OfferResponseDto,
  })
  async declineOffer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OfferResponseDto> {
    const offer = await this.offerService.declineOffer(id);
    return OfferResponseDto.fromEntity(offer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete accepted offers',
  })
  async deleteOffer(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.offerService.deleteOffer(id);
    return { message: 'Offer deleted successfully' };
  }

  @Post('expire-old')
  @ApiOperation({ summary: 'Expire old offers (admin endpoint)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Old offers expired successfully',
  })
  async expireOldOffers(): Promise<{ expiredCount: number }> {
    const expiredCount = await this.offerService.expireOldOffers();
    return { expiredCount };
  }
}
