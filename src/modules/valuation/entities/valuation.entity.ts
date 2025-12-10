import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { ValuationSource } from '../../../common/enums';
import { ValuationMetadata } from '../../../common/types';

@Entity('valuations')
@Index(['vehicleId', 'createdAt'])
export class Valuation {
  @ApiProperty({
    description: 'Valuation unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440001',
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
    description: 'Estimated vehicle value',
    example: 25000.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedValue: number;

  @ApiProperty({
    description: 'Minimum estimated value',
    example: 23000.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minValue: number;

  @ApiProperty({
    description: 'Maximum estimated value',
    example: 27000.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxValue: number;

  @ApiProperty({
    description: 'Valuation source',
    enum: ValuationSource,
    example: ValuationSource.EXTERNAL_API,
  })
  @Column({
    type: 'varchar',
    length: 100,
    enum: ValuationSource,
  })
  source: ValuationSource;

  @ApiProperty({
    description: 'Valuation date',
  })
  @CreateDateColumn()
  valuationDate: Date;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
  })
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      to: (value: ValuationMetadata) => value ? JSON.stringify(value) : null,
      from: (value: string) => value ? JSON.parse(value) : null,
    },
  })
  metadata: ValuationMetadata;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.valuations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @OneToMany('LoanApplication', 'valuation', { lazy: true })
  loanApplications: Promise<any[]>;
}
