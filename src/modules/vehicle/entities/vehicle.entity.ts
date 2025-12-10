import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  VehicleCondition,
  TransmissionType,
  FuelType,
} from '../../../common/enums';

@Entity('vehicles')
@Index(['make', 'model', 'year'])
export class Vehicle {
  @ApiProperty({
    description: 'Vehicle unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Vehicle Identification Number',
    example: '1HGBH41JXMN109186',
    maxLength: 17,
  })
  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @ApiProperty({
    description: 'Vehicle manufacturer',
    example: 'Toyota',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  make: string;

  @ApiProperty({
    description: 'Vehicle model',
    example: 'Camry',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  model: string;

  @ApiProperty({
    description: 'Vehicle year',
    example: 2020,
  })
  @Column({ type: 'integer' })
  year: number;

  @ApiProperty({
    description: 'Vehicle mileage',
    example: 25000,
  })
  @Column({ type: 'integer' })
  mileage: number;

  @ApiProperty({
    description: 'Vehicle condition',
    enum: VehicleCondition,
    example: VehicleCondition.GOOD,
  })
  @Column({
    type: 'varchar',
    length: 50,
    enum: VehicleCondition,
  })
  condition: VehicleCondition;

  @ApiProperty({
    description: 'Transmission type',
    enum: TransmissionType,
    example: TransmissionType.AUTOMATIC,
  })
  @Column({
    type: 'varchar',
    length: 50,
    enum: TransmissionType,
  })
  transmission: TransmissionType;

  @ApiProperty({
    description: 'Fuel type',
    enum: FuelType,
    example: FuelType.GASOLINE,
  })
  @Column({
    type: 'varchar',
    length: 50,
    enum: FuelType,
  })
  fuelType: FuelType;

  @ApiProperty({
    description: 'Vehicle color',
    example: 'Blue',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50 })
  color: string;

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

  // Relations will be added after creating other entities
  @OneToMany('Valuation', 'vehicle', { lazy: true })
  valuations: Promise<any[]>;

  @OneToMany('LoanApplication', 'vehicle', { lazy: true })
  loanApplications: Promise<any[]>;
}
