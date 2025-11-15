import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  tranxType: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  performedBy: string;
}
