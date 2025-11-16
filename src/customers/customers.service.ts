import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { APIResponse } from '../common/api/response.net';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { email: createCustomerDto.email },
            { phone: createCustomerDto.phone },
          ],
        },
      });

      if (existingCustomer) {
        throw new ConflictException(
          'Customer with this email or phone already exists',
        );
      }

      const customerData = {
        ...createCustomerDto,
        dateOfBirth: new Date(createCustomerDto.dateOfBirth),
      };

      const customer = await this.prisma.customer.create({
        data: customerData,
        include: {
          accounts: true, // return accounts immediately
        },
      });

      return APIResponse.successResponse({
        data: customer,
        message: 'Customer created successfully',
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create customer');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 20 } = paginationDto;

      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'Page and limit must be positive numbers',
        );
      }

      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.customer.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            accounts: true, // include account details
          },
        }),
        this.prisma.customer.count(),
      ]);

      const totalPages = Math.ceil(total / limit);
      return APIResponse.successResponse({
        data: {
          data,
          meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
        message: 'Customers fetched successfully',
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }

  async findOne(id: string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id },
        include: {
          accounts: true, // include account details
        },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      return APIResponse.successResponse({
        data: { customer },
        message: 'Customer fetched successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch customer');
    }
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    try {
      // Check if customer exists first
      await this.findOne(id);

      if (updateCustomerDto.email || updateCustomerDto.phone) {
        const existingCustomer = await this.prisma.customer.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  { email: updateCustomerDto.email },
                  { phone: updateCustomerDto.phone },
                ],
              },
            ],
          },
        });

        if (existingCustomer) {
          throw new ConflictException(
            'Customer with this email or phone already exists',
          );
        }
      }

      const { dateOfBirth, ...otherData } = updateCustomerDto;

      const updateData: any = { ...otherData };

      if (dateOfBirth !== undefined) {
        updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      }

      const updatedCustomer = await this.prisma.customer.update({
        where: { id },
        data: updateData,
        include: {
          accounts: true, // updated record includes accounts
        },
      });

      return APIResponse.successResponse({
        data: updatedCustomer,
        message: 'Customer updated successfully',
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update customer');
    }
  }
}
