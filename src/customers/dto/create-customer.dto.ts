import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'John',
    description: 'Customer first name',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiPropertyOptional({
    example: 'Michael',
    description: 'Customer middle name',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  middleName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Customer last name',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    example: '123 Main Street, City, State 12345',
    description: 'Customer address',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Customer email address',
    maxLength: 100,
  })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Customer phone number',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Customer date of birth (YYYY-MM-DD format)',
  })
  @IsDateString()
  dateOfBirth: string;
}
