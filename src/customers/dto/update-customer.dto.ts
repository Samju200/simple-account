import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({
    example: 'Jane',
    description: 'Customer first name',
    maxLength: 50,
    required: false,
  })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Elizabeth',
    description: 'Customer middle name',
    maxLength: 50,
    required: false,
  })
  middleName?: string;

  @ApiPropertyOptional({
    example: 'Smith',
    description: 'Customer last name',
    maxLength: 50,
    required: false,
  })
  lastName?: string;

  @ApiPropertyOptional({
    example: '456 Oak Avenue, City, State 12345',
    description: 'Customer address',
    maxLength: 255,
    required: false,
  })
  address?: string;

  @ApiPropertyOptional({
    example: 'jane.smith@example.com',
    description: 'Customer email address',
    maxLength: 100,
    required: false,
  })
  email?: string;

  @ApiPropertyOptional({
    example: '+1987654321',
    description: 'Customer phone number',
    maxLength: 20,
    required: false,
  })
  phone?: string;

  @ApiPropertyOptional({
    example: '1985-05-15',
    description: 'Customer date of birth (YYYY-MM-DD format)',
    required: false,
  })
  dateOfBirth?: string;
}
