import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ContextMenuPromptsService } from './context-menu-prompts.service';
import { UserId } from 'src/auth/userId.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateContextMenuPromptDto } from './context-menu-prompts.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('context-menu-prompts')
@Controller('context-menu-prompts')
export class ContextMenuPromptsController {
  constructor(
    private readonly contextMenuPromptsService: ContextMenuPromptsService,
  ) {}

  @Get()
  async find(@UserId() userId) {
    try {
      const response =
        await this.contextMenuPromptsService.findContextMenuPrompts(userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @Post()
  async create(@Body() body: CreateContextMenuPromptDto, @UserId() userId) {
    try {
      const response = await this.contextMenuPromptsService.create(
        body,
        userId,
      );
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }
}
