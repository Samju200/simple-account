import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { AccountType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAccountDto {
  @ApiProperty({
    enum: AccountType,
    example: AccountType.SAVINGS,
    description: 'Type of account to create',
  })
  @IsEnum(AccountType)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  acctType: AccountType;

  @ApiPropertyOptional({
    example: 0,
    description: 'Initial account balance (default: 0)',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;
}
