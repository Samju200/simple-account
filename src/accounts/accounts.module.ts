import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { CustomersModule } from '../customers/customers.module';
import { AccountNumberGenerator } from '../common/utils/account-number.generator';

@Module({
  imports: [CustomersModule],
  controllers: [AccountsController],
  providers: [AccountsService, AccountNumberGenerator],
  exports: [AccountsService],
})
export class AccountsModule {}
