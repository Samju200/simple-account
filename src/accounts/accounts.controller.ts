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
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus } from '@prisma/client';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('customers/:customerId/accounts')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(customerId, createAccountDto);
  }

  @Get('customers/:customerId/accounts')
  findAllByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query('status') status?: AccountStatus,
  ) {
    return this.accountsService.findAllByCustomer(customerId, status);
  }

  @Get('accounts/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findOne(id);
  }

  @Get('customers/:customerId/accounts/:accountId')
  findOneByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ) {
    return this.accountsService.findOneByCustomer(customerId, accountId);
  }

  @Put('customers/:customerId/accounts/:accountId')
  update(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(customerId, accountId, updateAccountDto);
  }
}
