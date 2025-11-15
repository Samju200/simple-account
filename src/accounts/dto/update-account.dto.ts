import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
