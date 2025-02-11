import { Module } from '@nestjs/common';
import { F3EvolutionService } from './f3-evolution.service';
import { F3EvolutionController } from './f3-evolution.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F3EvolutionController],
  providers: [F3EvolutionService, PrismaService],
})
export class F3EvolutionModule {}
