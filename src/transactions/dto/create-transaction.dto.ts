import { IsEnum, IsNumber, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: 'DEPOSIT',
    description:
      'Type of transaction (case-insensitive, will be converted to uppercase)',
  })
  @IsEnum(TransactionType, {
    message: 'Transaction type must be either DEPOSIT or WITHDRAWAL',
  })
  @Transform(({ value }) => value.toUpperCase())
  tranxType: TransactionType;

  @ApiProperty({
    example: 100.5,
    description: 'Transaction amount (must be greater than 0)',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;
}
