import { Module } from '@nestjs/common';
import { F0AiService } from './f0-ai.service';
import { F0AiController } from './f0-ai.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F0AiController],
  providers: [F0AiService, PrismaService],
})
export class F0AiModule {}
