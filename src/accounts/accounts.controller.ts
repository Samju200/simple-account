import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user-decorator';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@ApiTags('Accounts')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('customers/:customerId/accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new account for customer',
    description:
      'Create a new bank account for a specific customer. Each customer can have only one account of each type.',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully',
    schema: {
      example: {
        success: true,
        message: 'Account created successfully',
        data: {
          id: 'account-uuid',
          accountNumber: 'SAV00123456789',
          acctType: 'SAVINGS',
          balance: 0,
          status: 'ACTIVE',
          custId: 'customer-uuid',
          createdBy: 'user-uuid',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          customer: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer already has an account of this type',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiBody({ type: CreateAccountDto })
  create(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() createAccountDto: CreateAccountDto,
    @GetUser() user: User,
  ) {
    const createdBy: string = user.id;
    return this.accountsService.create(customerId, createAccountDto, createdBy);
  }

  @Get('customers/:customerId/accounts')
  @ApiOperation({
    summary: 'Get all accounts for a customer',
    description:
      'Retrieve all accounts for a specific customer, optionally filtered by status',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AccountStatus,
    description: 'Filter accounts by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accounts retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer accounts fetched successfully',
        data: [
          {
            id: 'account-uuid',
            accountNumber: 'SAV00123456789',
            acctType: 'SAVINGS',
            balance: 1000.5,
            status: 'ACTIVE',
            custId: 'customer-uuid',
            createdBy: 'user-uuid',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
            customer: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  findAllByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query('status') status?: AccountStatus,
  ) {
    return this.accountsService.findAllByCustomer(customerId, status);
  }

  @Get('accounts/:id')
  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Retrieve a specific account by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Account fetched successfully',
        data: {
          id: 'account-uuid',
          accountNumber: 'SAV00123456789',
          acctType: 'SAVINGS',
          balance: 1000.5,
          status: 'ACTIVE',
          custId: 'customer-uuid',
          createdBy: 'user-uuid',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          customer: {
            id: 'customer-uuid',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findOne(id);
  }

  @Get('customers/:customerId/accounts/:accountId')
  @ApiOperation({
    summary: 'Get specific account for a customer',
    description:
      'Retrieve a specific account that belongs to a specific customer',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Customer account fetched successfully',
        data: {
          id: 'account-uuid',
          accountNumber: 'SAV00123456789',
          acctType: 'SAVINGS',
          balance: 1000.5,
          status: 'ACTIVE',
          custId: 'customer-uuid',
          createdBy: 'user-uuid',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          customer: {
            id: 'customer-uuid',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account or customer not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  findOneByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.accountsService.findOneByCustomer(customerId, accountId);
  }

  @Put('customers/:customerId/accounts/:accountId')
  @ApiOperation({
    summary: 'Update account',
    description: 'Update account information for a specific customer account',
  })
  @ApiParam({
    name: 'customerId',
    description: 'Customer UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Account updated successfully',
        data: {
          id: 'account-uuid',
          accountNumber: 'SAV00123456789',
          acctType: 'SAVINGS',
          balance: 1000.5,
          status: 'ACTIVE',
          custId: 'customer-uuid',
          createdBy: 'user-uuid',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          customer: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account or customer not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiBody({ type: UpdateAccountDto })
  update(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @GetUser() user: User,
  ) {
    const updatedBy: string = user.id;
    return this.accountsService.update(
      customerId,
      accountId,
      updateAccountDto,
      updatedBy,
    );
  }

  @Put('accounts/:accountId/balance')
  @ApiOperation({
    summary: 'Update account balance',
    description:
      'Update the balance of a specific account by a given amount (deposit or withdrawal)',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account balance updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Account balance updated successfully',
        data: {
          id: 'account-uuid',
          accountNumber: 'SAV00123456789',
          acctType: 'SAVINGS',
          balance: 1200.5,
          status: 'ACTIVE',
          custId: 'customer-uuid',
          createdBy: 'user-uuid',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          customer: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
          },
        },
      },
    },
  })
  @ApiBody({ type: UpdateBalanceDto })
  updateBalance(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() updateBalanceDto: UpdateBalanceDto,
    @GetUser() user: User,
  ) {
    const updatedBy: string = user.id;
    return this.accountsService.updateBalance(
      accountId,
      updateBalanceDto.amount,
      updatedBy,
    );
  }
}
