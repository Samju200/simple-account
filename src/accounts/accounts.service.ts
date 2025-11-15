import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus, AccountType } from '@prisma/client';
import { AccountNumberGenerator } from '../common/utils/account-number.generator';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly accountNumberGenerator: AccountNumberGenerator,
  ) {}

  async create(customerId: string, dto: CreateAccountDto, createdBy: string) {
    await this.customersService.findOne(customerId);
    await this.checkDuplicateAccountType(customerId, dto.acctType);
    return this.prisma.$transaction(async (tx) => {
      const accountNumber =
        await this.accountNumberGenerator.generateUniqueAccountNumberByType(
          dto.acctType,
        );

      return tx.account.create({
        data: {
          ...dto,
          accountNumber,
          custId: customerId,
          createdBy,
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    });
  }
  private async checkDuplicateAccountType(
    customerId: string,
    accountType: AccountType,
  ): Promise<void> {
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        custId: customerId,
        acctType: accountType,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Customer already has an active ${accountType.toLowerCase()} account (Account #: ${existingAccount.accountNumber})`,
      );
    }
  }

  async findByAccountNumber(accountNumber: string) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with number ${accountNumber} not found`,
      );
    }

    return account;
  }

  // Update other methods to include accountNumber in responses
  async findAllByCustomer(customerId: string, status?: AccountStatus) {
    await this.customersService.findOne(customerId);

    const where: any = { custId: customerId };
    if (status) {
      where.status = status;
    }

    return this.prisma.account.findMany({
      where,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  // ... rest of your methods remain the same
  async findOneByCustomer(customerId: string, accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        custId: customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with ID ${accountId} not found for customer ${customerId}`,
      );
    }

    return account;
  }

  async update(
    customerId: string,
    accountId: string,
    updateAccountDto: UpdateAccountDto,
    updatedBy?: string,
  ) {
    await this.findOneByCustomer(customerId, accountId);

    const updateData: any = {
      ...updateAccountDto,
      updatedAt: new Date(),
    };

    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }

    return this.prisma.account.update({
      where: { id: accountId },
      data: updateData,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateBalance(accountId: string, amount: number) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: amount },
        updatedAt: new Date(),
      },
    });
  }
}
