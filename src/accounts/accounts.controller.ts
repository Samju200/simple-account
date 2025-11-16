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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus, User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user-decorator';

@Controller()
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('customers/:customerId/accounts')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Body() createAccountDto: CreateAccountDto,
    @GetUser() user: User, // Get the request object to access user info
  ) {
    console.log('user:', user);
    const createdBy: string = user.id;
    console.log('createdBy:', createdBy);
    // Get user email from token
    return this.accountsService.create(customerId, createAccountDto, createdBy);
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
    @Req() req: Request & { user?: { id: string; firstName: string } },
  ) {
    const updatedBy: string = req.user?.firstName ?? 'system';
    return this.accountsService.update(
      customerId,
      accountId,
      updateAccountDto,
      updatedBy,
    );
  }
}
