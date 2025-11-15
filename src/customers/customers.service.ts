import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
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

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
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

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }
}
