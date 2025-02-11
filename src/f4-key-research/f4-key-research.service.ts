import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class F4KeyResearchService {
  constructor(private prisma: PrismaService) {}

  async search(area: string) {
    return this.prisma.f4Data.findMany({
      where: { area },
      include: { countryLink: true },
    });
  }
}
