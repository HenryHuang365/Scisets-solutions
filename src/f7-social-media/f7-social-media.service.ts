import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class F7SocialMediaService {
  constructor(private prisma: PrismaService) {}

  async search(area: string) {
    return this.prisma.f7Data.findMany({ where: { area } });
  }
}
