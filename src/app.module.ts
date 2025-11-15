import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    CustomersModule,
    AccountsModule,
    TransactionsModule,
    AuthModule,
  ],
})
export class AppModule {}
