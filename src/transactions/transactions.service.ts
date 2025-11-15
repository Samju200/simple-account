import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(accountId: string, createTransactionDto: CreateTransactionDto) {
    const account = await this.accountsService.findOne(accountId);

    if (account.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Cannot perform transaction on inactive account',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let balanceChange = createTransactionDto.amount;

      if (createTransactionDto.tranxType === 'WITHDRAWAL') {
        balanceChange = -createTransactionDto.amount;

        if (account.balance < createTransactionDto.amount) {
          throw new BadRequestException('Insufficient funds');
        }
      }

      const transaction = await tx.transaction.create({
        data: {
          ...createTransactionDto,
          accountId,
        },
      });

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: balanceChange },
          updatedAt: new Date(),
        },
      });

      return transaction;
    });
  }

  async findAllByAccount(
    accountId: string,
    filters?: { startDate?: Date; endDate?: Date; type?: TransactionType },
  ) {
    await this.accountsService.findOne(accountId);

    const where: any = { accountId };

    if (filters?.startDate || filters?.endDate) {
      where.tranxDate = {};
      if (filters.startDate) where.tranxDate.gte = filters.startDate;
      if (filters.endDate) where.tranxDate.lte = filters.endDate;
    }

    if (filters?.type) {
      where.tranxType = filters.type;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            acctType: true,
            balance: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { tranxDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: {
          select: {
            id: true,
            acctType: true,
            balance: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }
}
