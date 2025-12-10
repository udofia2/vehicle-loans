import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { Valuation } from '../../valuation/entities/valuation.entity';
import { LoanApplicationStatus } from '../../../common/enums';

@Entity('loan_applications')
@Index(['vehicleId', 'status'])
@Index(['status', 'createdAt'])
export class LoanApplication {
  @ApiProperty({
    description: 'Loan application unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Vehicle ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({ type: 'uuid' })
  vehicleId: string;

  @ApiProperty({
    description: 'Valuation ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Column({ type: 'uuid' })
  valuationId: string;

  @ApiProperty({
    description: 'Requested loan amount',
    example: 20000.0,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  loanAmount: number;

  @ApiProperty({
    description: 'Interest rate percentage',
    example: 5.25,
  })
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number;

  @ApiProperty({
    description: 'Loan term in months',
    example: 60,
  })
  @Column({ type: 'integer' })
  termMonths: number;

  @ApiProperty({
    description: 'Loan application status',
    enum: LoanApplicationStatus,
    example: LoanApplicationStatus.PENDING,
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: LoanApplicationStatus.PENDING,
    enum: LoanApplicationStatus,
  })
  status: LoanApplicationStatus;

  @ApiProperty({
    description: 'Additional notes',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

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
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.loanApplications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => Valuation, (valuation) => valuation.loanApplications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'valuationId' })
  valuation: Valuation;

  @OneToMany('Offer', 'loanApplication', { lazy: true })
  offers: Promise<any[]>;
}
