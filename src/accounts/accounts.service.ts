import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountStatus, AccountType } from '@prisma/client';
import { AccountNumberGenerator } from '../common/utils/account-number.generator';
import { APIResponse } from '../common/api/response.net';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customersService: CustomersService,
    private readonly accountNumberGenerator: AccountNumberGenerator,
  ) {}

  async create(customerId: string, dto: CreateAccountDto, createdBy: string) {
    try {
      await this.customersService.findOne(customerId);
      await this.checkDuplicateAccountType(customerId, dto.acctType);

      const result = await this.prisma.$transaction(async (tx) => {
        const accountNumber =
          await this.accountNumberGenerator.generateUniqueAccountNumberByType(
            dto.acctType,
          );

        const account = await tx.account.create({
          data: {
            ...dto,
            accountNumber,
            custId: customerId,
            createdBy: createdBy,
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

        return account;
      });

      return APIResponse.successResponse({
        data: result,
        message: 'Account created successfully',
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create account');
    }
  }

  private async checkDuplicateAccountType(
    customerId: string,
    accountType: AccountType,
  ): Promise<void> {
    try {
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
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to check duplicate account',
      );
    }
  }

  async findByAccountNumber(accountNumber: string) {
    try {
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

      return APIResponse.successResponse({
        data: account,
        message: 'Account fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch account by account number',
      );
    }
  }

  async findAllByCustomer(customerId: string, status?: AccountStatus) {
    try {
      await this.customersService.findOne(customerId);

      const where: any = { custId: customerId };
      if (status) {
        where.status = status;
      }

      const accounts = await this.prisma.account.findMany({
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

      return APIResponse.successResponse({
        data: accounts,
        message: 'Customer accounts fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch customer accounts',
      );
    }
  }

  async findOne(id: string) {
    try {
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

      return APIResponse.successResponse({
        data: account,
        message: 'Account fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch account');
    }
  }

  async findOneByCustomer(customerId: string, accountId: string) {
    try {
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

      return APIResponse.successResponse({
        data: account,
        message: 'Customer account fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch customer account',
      );
    }
  }

  async update(
    customerId: string,
    accountId: string,
    updateAccountDto: UpdateAccountDto,
    updatedBy?: string,
  ) {
    try {
      await this.findOneByCustomer(customerId, accountId);

      const updateData: any = {
        ...updateAccountDto,
        updatedAt: new Date(),
      };

      if (updatedBy) {
        updateData.updatedBy = updatedBy;
      }

      const updatedAccount = await this.prisma.account.update({
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

      return APIResponse.successResponse({
        data: updatedAccount,
        message: 'Account updated successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  async updateBalance(accountId: string, amount: number, updatedBy: string) {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) {
        throw new BadRequestException('Invalid amount provided');
      }

      const updatedAccount = await this.prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: amount },
          updatedAt: new Date(),
          updatedBy: updatedBy,
        },
      });

      return APIResponse.successResponse({
        data: updatedAccount,
        message: 'Account balance updated successfully',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update account balance',
      );
    }
  }
}
