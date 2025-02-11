import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { OpenAIAssistantService } from './openai-assistant.service';
import {
  CreateAssistantDto,
  CreateMessageDto,
  ListMessageDto,
  CreateRunDto,
  RetrieveRunDto,
} from './openai-assistant.dto';

@Controller('openai-assistant')
export class OpenAIAssistantController {
  constructor(
    private readonly openAIAssistantService: OpenAIAssistantService,
  ) {}

  @Post('create')
  async createAssistant(@Body() dto: CreateAssistantDto) {
    try {
      const response = await this.openAIAssistantService.createAssistant(dto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('list')
  async listAssistant() {
    try {
      const response = await this.openAIAssistantService.listAssistant();
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('createMessage')
  async createMessage(@Body() dto: CreateMessageDto) {
    try {
      const response = await this.openAIAssistantService.createMessage(dto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('listMessage')
  async listMessage(@Body() dto: ListMessageDto) {
    try {
      const response = await this.openAIAssistantService.listMessage(dto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('createRun')
  async createRun(@Body() dto: CreateRunDto) {
    try {
      const response = await this.openAIAssistantService.createRun(dto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('retrieveRun')
  async retrieveRun(@Body() dto: RetrieveRunDto) {
    try {
      const response = await this.openAIAssistantService.retrieveRun(dto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
