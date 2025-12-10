import { PartialType } from '@nestjs/swagger';
import { CreateLoanApplicationDto } from './create-loan-application.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LoanApplicationStatus } from '../../../common/enums';

export class UpdateLoanApplicationDto extends PartialType(CreateLoanApplicationDto) {
  @ApiPropertyOptional({
    description: 'Loan application status',
    enum: LoanApplicationStatus,
  })
  @IsOptional()
  @IsEnum(LoanApplicationStatus)
  status?: LoanApplicationStatus;
}