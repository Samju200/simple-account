import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType } from '@prisma/client';
import { APIResponse } from '../common/api/response.net';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    accountId: string,
    createTransactionDto: CreateTransactionDto,
    performedBy: string,
  ) {
    try {
      // Verify account exists
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      // Validate transaction amount
      if (createTransactionDto.amount <= 0) {
        throw new BadRequestException(
          'Transaction amount must be greater than 0',
        );
      }

      const tranxType = createTransactionDto.tranxType.toUpperCase().trim();

      // Validate transaction type
      if (!['DEPOSIT', 'WITHDRAWAL'].includes(tranxType)) {
        throw new BadRequestException(
          'Invalid transaction type. Must be DEPOSIT or WITHDRAWAL',
        );
      }

      if (tranxType === 'WITHDRAWAL') {
        if (account.balance < createTransactionDto.amount) {
          throw new BadRequestException('Insufficient funds');
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            ...createTransactionDto,
            tranxType: tranxType as TransactionType,
            accountId,
            performedBy: performedBy,
          },
        });

        if (tranxType === 'DEPOSIT') {
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: { increment: createTransactionDto.amount },
              updatedBy: performedBy,
            },
          });
        }

        if (tranxType === 'WITHDRAWAL') {
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: { decrement: createTransactionDto.amount },
              updatedBy: performedBy,
            },
          });
        }

        const updatedTransaction = await tx.transaction.findUnique({
          where: { id: transaction.id },
          include: {
            account: {
              select: {
                accountNumber: true,
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
        });

        return updatedTransaction;
      });

      return APIResponse.successResponse({
        data: result,
        message: `Transaction ${tranxType.toLowerCase()} completed successfully`,
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create transaction');
    }
  }

  async findAllByAccount(
    accountId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      type?: TransactionType;
    },
  ) {
    try {
      // Verify account exists
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      const where: any = { accountId };

      if (filters?.startDate || filters?.endDate) {
        where.tranxDate = {};
        if (filters.startDate) {
          where.tranxDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.tranxDate.lte = filters.endDate;
        }
      }

      if (filters?.type) {
        where.tranxType = filters.type;
      }

      const transactions = await this.prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: {
              accountNumber: true,
              acctType: true,
            },
          },
        },
        orderBy: { tranxDate: 'desc' },
      });

      return APIResponse.successResponse({
        data: transactions,
        message: 'Transactions fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch transactions');
    }
  }

  async findOne(id: string) {
    try {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id },
        include: {
          account: {
            select: {
              accountNumber: true,
              acctType: true,
              balance: true,
              customer: {
                select: {
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

      return APIResponse.successResponse({
        data: transaction,
        message: 'Transaction fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch transaction');
    }
  }

  async getAccountTransactionSummary(accountId: string) {
    try {
      // Verify account exists
      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${accountId} not found`);
      }

      const [totalDeposits, totalWithdrawals, transactionCount] =
        await Promise.all([
          this.prisma.transaction.aggregate({
            where: {
              accountId,
              tranxType: 'DEPOSIT',
            },
            _sum: {
              amount: true,
            },
          }),
          this.prisma.transaction.aggregate({
            where: {
              accountId,
              tranxType: 'WITHDRAWAL',
            },
            _sum: {
              amount: true,
            },
          }),
          this.prisma.transaction.count({
            where: { accountId },
          }),
        ]);

      const summary = {
        accountId,
        accountNumber: account.accountNumber,
        currentBalance: account.balance,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        transactionCount,
        netFlow:
          (totalDeposits._sum.amount || 0) -
          (totalWithdrawals._sum.amount || 0),
      };

      return APIResponse.successResponse({
        data: summary,
        message: 'Transaction summary fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch transaction summary',
      );
    }
  }
}
