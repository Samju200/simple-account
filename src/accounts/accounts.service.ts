import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
  ) {}

  async create(customerId: string, createAccountDto: CreateAccountDto) {
    await this.customersService.findOne(customerId);

    return this.prisma.account.create({
      data: {
        ...createAccountDto,
        custId: customerId,
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
  }

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
  ) {
    await this.findOneByCustomer(customerId, accountId);

    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        ...updateAccountDto,
        updatedAt: new Date(),
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
