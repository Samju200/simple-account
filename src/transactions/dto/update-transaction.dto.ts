import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiPropertyOptional({
    enum: TransactionType,
    example: 'WITHDRAWAL',
    description: 'Type of transaction',
  })
  tranxType?: TransactionType;

  @ApiPropertyOptional({
    example: 50.25,
    description: 'Transaction amount (must be greater than 0)',
    minimum: 0.01,
  })
  amount?: number;
}
