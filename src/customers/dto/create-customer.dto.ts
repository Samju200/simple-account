import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  middleName?: string;

  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsDateString()
  dateOfBirth: string;
}
