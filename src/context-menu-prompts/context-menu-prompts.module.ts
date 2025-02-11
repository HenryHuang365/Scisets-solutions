import { Module } from '@nestjs/common';
import { ContextMenuPromptsService } from './context-menu-prompts.service';
import { ContextMenuPromptsController } from './context-menu-prompts.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ContextMenuPromptsController],
  providers: [ContextMenuPromptsService, PrismaService],
})
export class ContextMenuPromptsModule {}
