import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsEnum(AccountType)
  acctType: AccountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsString()
  createdBy: string;
}
