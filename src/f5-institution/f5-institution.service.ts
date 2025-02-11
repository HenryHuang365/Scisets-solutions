import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class F5InstitutionService {
  constructor(private prisma: PrismaService) {}

  async search(page = 1) {
    const limit = 10;
    const offset = page * limit - limit;
    const institutions = await this.prisma.institution.findMany({
      include: { Authors: true, _count: true },
      take: limit,
      skip: offset,
    });
    return institutions;
  }
}
