import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ExtGptService } from './ext-gpt.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserId } from 'src/auth/userId.decorator';
import {
  CreateChatDto,
  PageAnalyzeDto,
  SendMessageChatDto,
  UrlAnalyzeDto,
  WritingDto,
} from './ext-gpt.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileUpload } from './fileUpload.decorator';
import { UploadGuard } from './upload.guard';
import { ChatInterceptor } from './chat.interseptor';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('ext-gpt')
@Controller('ext-gpt')
export class ExtGptController {
  constructor(private readonly extGptService: ExtGptService) {}

  @ApiOperation({ summary: 'Send message to chat' })
  @UseInterceptors(ChatInterceptor)
  @Post()
  async sendMessage(@Body() createChatDto: SendMessageChatDto) {
    try {
      const response = await this.extGptService.sendMessage(createChatDto);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiOperation({ summary: 'create new chat' })
  @Post('create')
  async createChat(@Body() dto: CreateChatDto, @UserId() userId) {
    try {
      const response = await this.extGptService.create(dto, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @ApiOperation({ summary: 'Get all chats with message' })
  @UseInterceptors(ChatInterceptor)
  @Get()
  async getChats(@UserId() userId) {
    try {
      const response = await this.extGptService.getChats(userId);
      return response;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @ApiOperation({ summary: 'Get history' })
  @UseInterceptors(ChatInterceptor)
  @Get('history')
  async getFileHistory(@UserId() userId) {
    try {
      const response = await this.extGptService.getHistory(userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('fileAnalyze')
  @UseInterceptors(ChatInterceptor)
  @UseGuards(UploadGuard)
  async fileAnalyze(@FileUpload() file, @UserId() userId) {
    try {
      const response = await this.extGptService.fileAnalyze(file, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @UseInterceptors(ChatInterceptor)
  @Post('urlAnalyze')
  async urlAnalyze(@Body() body: UrlAnalyzeDto, @UserId() userId) {
    try {
      const response = await this.extGptService.urlAnalyze(body.url, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }
  @UseInterceptors(ChatInterceptor)
  @Post('pageAnalyze')
  async pageAnalyze(@Body() body: PageAnalyzeDto, @UserId() userId) {
    try {
      const response = await this.extGptService.pageAnalyze(body.html, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('imageAnalyze')
  @UseGuards(UploadGuard)
  @UseInterceptors(ChatInterceptor)
  async imageAnalyze(@FileUpload() file, @UserId() userId) {
    try {
      const response = await this.extGptService.imageAnalyze(file, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @Post('writing')
  async writing(@Body() body: WritingDto, @UserId() userId) {
    try {
      const response = await this.extGptService.writing(body, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }
}
