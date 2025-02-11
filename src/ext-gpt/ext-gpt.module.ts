import { Module } from '@nestjs/common';
import { ExtGptService } from './ext-gpt.service';
import { ExtGptController } from './ext-gpt.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ExtGptController],
  providers: [ExtGptService, PrismaService],
})
export class ExtGptModule {}
