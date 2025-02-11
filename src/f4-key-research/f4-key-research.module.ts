import { Module } from '@nestjs/common';
import { F4KeyResearchService } from './f4-key-research.service';
import { F4KeyResearchController } from './f4-key-research.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F4KeyResearchController],
  providers: [F4KeyResearchService, PrismaService],
})
export class F4KeyResearchModule {}
