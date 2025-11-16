import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user-decorator';

@ApiTags('Transactions')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('accounts/:accountId/transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create a deposit or withdrawal transaction for an account. Transaction type is case-insensitive. Withdrawals require sufficient funds.',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction deposit completed successfully',
        data: {
          id: 'transaction-uuid',
          tranxType: 'DEPOSIT',
          amount: 100.5,
          tranxDate: '2023-01-01T00:00:00.000Z',
          accountId: 'account-uuid',
          performedBy: 'user-uuid',
          account: {
            accountNumber: 'SAV00123456789',
            acctType: 'SAVINGS',
            balance: 1100.5,
            customer: {
              firstName: 'John',
              lastName: 'Doe',
            },
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
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid amount or insufficient funds for withdrawal',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiBody({ type: CreateTransactionDto })
  create(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
  ) {
    const performedBy = user.id;
    return this.transactionsService.create(
      accountId,
      createTransactionDto,
      performedBy,
    );
  }

  @Get('accounts/:accountId/transactions')
  @ApiOperation({
    summary: 'Get transactions for an account',
    description:
      'Retrieve all transactions for a specific account with optional filtering by date range and type',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2023-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by transaction type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transactions retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Transactions fetched successfully',
        data: [
          {
            id: 'transaction-uuid',
            tranxType: 'DEPOSIT',
            amount: 100.5,
            tranxDate: '2023-01-01T00:00:00.000Z',
            accountId: 'account-uuid',
            performedBy: 'user-uuid',
            account: {
              accountNumber: 'SAV00123456789',
              acctType: 'SAVINGS',
            },
          },
          {
            id: 'transaction-uuid-2',
            tranxType: 'WITHDRAWAL',
            amount: 50.25,
            tranxDate: '2023-01-02T00:00:00.000Z',
            accountId: 'account-uuid',
            performedBy: 'user-uuid',
            account: {
              accountNumber: 'SAV00123456789',
              acctType: 'SAVINGS',
            },
          },
        ],
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid date format',
  })
  findAllByAccount(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: TransactionType,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
    };

    return this.transactionsService.findAllByAccount(accountId, filters);
  }

  @Get('transactions/:id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description:
      'Retrieve a specific transaction by its ID with full account and customer details',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction fetched successfully',
        data: {
          id: 'transaction-uuid',
          tranxType: 'DEPOSIT',
          amount: 100.5,
          tranxDate: '2023-01-01T00:00:00.000Z',
          accountId: 'account-uuid',
          performedBy: 'user-uuid',
          account: {
            accountNumber: 'SAV00123456789',
            acctType: 'SAVINGS',
            balance: 1100.5,
            customer: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Get('accounts/:accountId/transactions/summary')
  @ApiOperation({
    summary: 'Get transaction summary for an account',
    description:
      'Get a summary of transactions including totals and counts for a specific account',
  })
  @ApiParam({
    name: 'accountId',
    description: 'Account UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction summary retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction summary fetched successfully',
        data: {
          accountId: 'account-uuid',
          accountNumber: 'SAV00123456789',
          currentBalance: 1050.25,
          totalDeposits: 1100.5,
          totalWithdrawals: 50.25,
          transactionCount: 2,
          netFlow: 1050.25,
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
  getAccountTransactionSummary(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.transactionsService.getAccountTransactionSummary(accountId);
  }
}
