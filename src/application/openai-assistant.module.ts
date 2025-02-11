import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { OpenAIAssistantService } from './openai-assistant.service';
import { OpenAIAssistantController } from './openai-assistant.controller';

@Module({
  controllers: [OpenAIAssistantController],
  providers: [OpenAIAssistantService, PrismaService],
})
export class OpenAIAssistantModule {}
