import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Account status',
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  @Transform(({ value }) => value.toUpperCase())
  status?: AccountStatus;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Name of user who updated the account',
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
