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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user-decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('accounts/:accountId/transactions')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User, // Get the authenticated user
  ) {
    // Use user ID from JWT token instead of manual performedBy input
    const performedBy = user.id;
    return this.transactionsService.create(
      accountId,
      createTransactionDto,
      performedBy,
    );
  }

  @Get('accounts/:accountId/transactions')
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
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }
}
