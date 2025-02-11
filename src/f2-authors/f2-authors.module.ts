import { Module } from '@nestjs/common';
import { F2AuthorsService } from './f2-authors.service';
import { F2AuthorsController } from './f2-authors.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F2AuthorsController],
  providers: [F2AuthorsService, PrismaService],
})
export class F2AuthorsModule {}
