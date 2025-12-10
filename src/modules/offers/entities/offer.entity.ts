import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LoanApplication } from '../../loan/entities/loan-application.entity';
import { OfferStatus } from '../../../common/enums';

@Entity('offers')
@Index(['loanApplicationId', 'status'])
@Index(['status', 'expiresAt'])
export class Offer {
  @ApiProperty({
    description: 'Offer unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Loan application ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Column({ type: 'uuid' })
  loanApplicationId: string;

  @ApiProperty({
    description: 'Amount bank is willing to lend',
    example: 5000000.0,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  offeredAmount: number;

  @ApiProperty({
    description: 'Interest rate percentage',
    example: 15.5,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 36,
  })
  @Column({ type: 'int' })
  loanTerm: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 173611.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPayment: number;

  @ApiProperty({
    description: 'Total amount payable',
    example: 6250000.0,
  })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPayable: number;

  @ApiProperty({
    description: 'Offer status',
    enum: OfferStatus,
    example: OfferStatus.ACTIVE,
  })
  @Column({
    type: 'varchar',
    enum: OfferStatus,
    default: OfferStatus.ACTIVE,
  })
  status: OfferStatus;

  @ApiProperty({
    description: 'Offer expiration timestamp',
    example: '2025-12-16T10:00:00.000Z',
  })
  @Column({ type: 'datetime' })
  expiresAt: Date;

  @ApiProperty({
    description: 'When offer was accepted (nullable)',
    example: null,
    required: false,
  })
  @Column({ type: 'datetime', nullable: true })
  acceptedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(
    () => LoanApplication,
    (loanApplication) => loanApplication.offers,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'loanApplicationId' })
  loanApplication: LoanApplication;
}
