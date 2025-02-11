import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateContextMenuPromptDto } from './context-menu-prompts.dto';

@Injectable()
export class ContextMenuPromptsService {
  constructor(private prisma: PrismaService) {}

  findContextMenuPrompts(userId: string) {
    return this.prisma.contextMenuPrompts.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
    });
  }

  create(body: CreateContextMenuPromptDto, userId: string) {
    return this.prisma.contextMenuPrompts.create({
      data: { ...body, userId },
    });
  }
}
