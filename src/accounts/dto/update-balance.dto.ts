// src/accounts/dto/update-balance.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateBalanceDto {
  @ApiProperty({
    description: 'Amount to add (positive) or subtract (negative)',
    example: 100.5,
    minimum: -1000000,
    maximum: 1000000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(-1000000, { message: 'Amount cannot be less than -1,000,000' })
  @Max(1000000, { message: 'Amount cannot exceed 1,000,000' })
  amount: number;
}
