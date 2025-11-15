import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountNumberGenerator {
  constructor(private prisma: PrismaService) {}

  async generateUniqueAccountNumberByType(acctType: string): Promise<string> {
    while (true) {
      const accountNumber = this.generateAccountNumberByType(acctType);

      const exists = await this.prisma.account.findUnique({
        where: { accountNumber },
      });

      if (!exists) {
        return accountNumber;
      }
      continue;
    }
  }

  generateAccountNumberByType(acctType: string): string {
    const prefixes: Record<string, string> = {
      SAVINGS: '10',
      CHECKING: '20',
      CREDIT: '30',
      LOAN: '40',
    };

    const prefix = prefixes[acctType] ?? '00';
    const random = Math.floor(10000000 + Math.random() * 90000000); // 8 digits

    return prefix + random;
  }
}
