import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  CreateAssistantDto,
  CreateMessageDto,
  ListMessageDto,
  CreateRunDto,
  RetrieveRunDto,
} from './openai-assistant.dto';

@Injectable()
export class OpenAIAssistantService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI();
  }

  async createAssistant(dto: CreateAssistantDto) {
    try {
      const assistant = await this.openai.beta.assistants.create({
        name: dto.name,
        instructions: dto.instructions,
        model: dto.model,
        tools: [{ type: 'file_search' }],
      });

      return assistant;
    } catch (e) {
      throw new Error(`Failed to create assistant: ${e.message}`);
    }
  }

  async listAssistant() {
    try {
      const response = await this.openai.beta.assistants.list({
        order: 'desc',
        limit: 10,
      });

      const assistants = response.data;
      return assistants;
    } catch (e) {
      throw new Error(`Failed to list assistant: ${e.message}`);
    }
  }

  async createMessage(dto: CreateMessageDto) {
    try {
      const response = await this.openai.beta.threads.messages.create(
        dto.threadId,
        {
          role: 'user',
          content: dto.content,
        },
      );

      return response;
    } catch (e) {
      throw new Error(
        `Failed to create a message in the thread ${dto.threadId}: ${e.message}`,
      );
    }
  }

  async listMessage(dto: ListMessageDto) {
    try {
      const response = await this.openai.beta.threads.messages.list(
        dto.threadId,
      );

      return response;
    } catch (e) {
      throw new Error(
        `Failed to list messages in the thread ${dto.threadId} : ${e.message}`,
      );
    }
  }

  async createRun(dto: CreateRunDto) {
    try {
      const response = await this.openai.beta.threads.runs.create(
        dto.threadId,
        {
          assistant_id: dto.assistantId,
        },
      );

      return response;
    } catch (e) {
      throw new Error(`Failed to run a thread ${dto.threadId}: ${e.message}`);
    }
  }

  async retrieveRun(dto: RetrieveRunDto) {
    try {
      const response = await this.openai.beta.threads.runs.retrieve(
        dto.threadId,
        dto.runId,
      );

      return response;
    } catch (e) {
      throw new Error(
        `Failed to retrieve run a thread ${dto.threadId}: ${e.message}`,
      );
    }
  }
}
