import { IsEnum, IsNumber, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsEnum(TransactionType, {
    message: 'Transaction type must be either DEPOSIT or WITHDRAWAL',
  })
  @Transform(({ value }) => value.toUpperCase()) // Transform to uppercase
  tranxType: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
