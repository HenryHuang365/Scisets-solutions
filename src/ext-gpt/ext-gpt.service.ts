import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { fetchChatGPT, removeLargeText } from 'src/utils/utils';
import {
  ChatGptModel,
  CreateChatDto,
  SendMessageChatDto,
  WritingDto,
} from './ext-gpt.dto';
import { convert as htmlToText } from 'html-to-text';
import { ChatType, LoggingType } from '@prisma/client';
import { createWorker } from 'tesseract.js';
import { createContext, runInContext } from 'node:vm';
import { gotScraping } from 'got-scraping';
import { randomUUID } from 'node:crypto';
import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { MultipartFile } from '@fastify/multipart';
import {
  extract as extractArticleFromUrl,
  extractFromHtml as extractArticleFromHtml,
} from '@extractus/article-extractor';
import {
  createTextExtractor,
  officeDocumentExtractor,
  pdfExtractor,
  plainTextExtractor,
} from './TextExtractor';

@Injectable()
export class ExtGptService {
  private textExtractor;

  constructor(private prisma: PrismaService) {
    this.textExtractor = createTextExtractor();
    this.textExtractor.setStrategy('text/plain', plainTextExtractor);
    this.textExtractor.setStrategy('application/pdf', pdfExtractor);
    this.textExtractor.setStrategy(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      officeDocumentExtractor,
    );
    this.textExtractor.setStrategy(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      officeDocumentExtractor,
    );
  }

  getChats(doctorId) {
    return this.prisma.chats.findMany({ where: { userId: doctorId } });
  }

  async create(dto: CreateChatDto, userId: string) {
    return this.prisma.chats.create({
      data: {
        userId: userId,
        messages: [],
        model: dto.model,
        title: 'Ai chat',
        type: ChatType.AI_CHAT,
      },
    });
  }

  async sendMessage(sendMessageChatDto: SendMessageChatDto) {
    const { message, chatId } = sendMessageChatDto;
    const chatDB = await this.prisma.chats.findUnique({
      where: { id: chatId },
    });
    if (!chatDB) throw new Error(`Chat not found`);

    const userMessage = { content: message, role: 'user', date: new Date() };
    const messages = chatDB.messages as Array<any>;
    messages.push(userMessage);
    const messagesFiltered = messages.filter(
      (e) => e.role === 'user' || e.role === 'assistant',
    );

    const promptName =
      chatDB.model === ChatGptModel.ChatGPT4
        ? 'DEFAULT_PROMPT_GPT4'
        : 'DEFAULT_PROMPT_GPT3.5';

    const defaultPrompt = await this.prisma.openAIPrompts.findUnique({
      where: { name: promptName },
    });
    if (chatDB.type === ChatType.AI_CHAT)
      messagesFiltered.unshift({
        role: 'system',
        content: defaultPrompt.prompt,
      });

    const data = {
      model: chatDB.model,
      messages: messagesFiltered.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };

    const messageFromGPT = await fetchChatGPT(data);

    const gptMessage = {
      content: messageFromGPT.content,
      role: 'system',
      date: new Date(),
    };
    messages.push(gptMessage);

    const saveChat = await this.prisma.chats.update({
      where: { id: chatDB.id },
      data: { messages },
    });
    setImmediate(async () => {
      this.summarizeTitle(saveChat);
    });
    return saveChat;
  }

  async summarizeTitle(chat) {
    if (chat.messages.length >= 3) return;

    const titleSummarize = await this.prisma.openAIPrompts.findUnique({
      where: { name: 'TITLE_SUMMARIZE' },
    });
    const textFromChat = chat.messages.reduce(
      (acc, val) => acc + ' ' + val.content,
      '',
    );
    const data = {
      model: chat.model,
      messages: [
        {
          role: 'assistant',
          content: `${titleSummarize.prompt}${textFromChat}`,
        },
      ],
    };
    const messageFromGPT = await fetchChatGPT(data);
    await this.prisma.chats.update({
      where: { id: chat.id },
      data: { title: messageFromGPT.content },
    });
  }

  async addMessagesToChat(chatId: string, messages: any[]) {
    return this.prisma.chats.update({
      where: { id: chatId },
      data: { messages },
    });
  }

  async analyzeTextAndGenerateResponse(
    text: string,
    promptName: string,
    userId: string,
    loggingType: LoggingType,
  ) {
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const prompt = await this.prisma.openAIPrompts.findUnique({
      where: { name: promptName },
    });

    const data = {
      model,
      messages: [
        { role: 'assistant', content: prompt.prompt },
        { role: 'user', content: text },
      ],
    };
    const openAiResponse = await fetchChatGPT(data);

    const prompt3Question = await this.prisma.openAIPrompts.findUnique({
      where: { name: 'ADDITION_QUESTIONS' },
    });

    const data3Questions = {
      model,
      messages: [
        { role: 'assistant', content: prompt3Question.prompt },
        { role: 'user', content: openAiResponse.content },
      ],
    };
    const openAiResponse3Questions = await fetchChatGPT(data3Questions);

    const chat = await this.prisma.chats.create({
      data: {
        userId,
        messages: [
          ...data.messages,
          { ...openAiResponse, date: new Date() },
          {
            role: 'additionalQuestion',
            content: openAiResponse3Questions.content,
            date: new Date(),
          },
        ],
        type: ChatType.ANALYTICS,
        title: 'Analytics',
      },
    });
    setImmediate(async () => {
      this.summarizeTitle(chat);
      await this.prisma.logging.create({
        data: {
          userId,
          request: text,
          response: openAiResponse?.content,
          type: loggingType,
        },
      });
    });
    return chat;
  }

  async fileAnalyze(file: MultipartFile, userId: string) {
    const fileBuffer = await file.toBuffer();
    const s3Url = await this.fileUpload(fileBuffer, file.filename);
    const fileForAnalyze = { mimetype: file.mimetype, buffer: fileBuffer };

    let text = await this.textExtractor.extract(fileForAnalyze);
    text = removeLargeText(text);
    if (!text.trim()) {
      throw new Error('Content not found');
    }

    return this.analyzeTextAndGenerateResponse(
      text,
      'SUMMARIZE_FILE',
      userId,
      LoggingType.FILE,
    );
  }
  async urlAnalyze(url: string, userId: string) {
    let text: string;
    const article = await extractArticleFromUrl(url);
    if (article) {
      text = JSON.stringify(article);
      if (article.image) {
        const response = await gotScraping.get(article.image);
        const fileBuffer = response.rawBody as Buffer;
        const imageName = article.image.split('/').pop();
        const s3Url = await this.fileUpload(fileBuffer, imageName);
      }
    } else {
      const response = await gotScraping.get(url);
      const { body } = response;
      text = htmlToText(body) || body;
    }

    if (!text) {
      throw new Error('Content not found');
    }

    text = removeLargeText(text);

    return this.analyzeTextAndGenerateResponse(
      text,
      'SUMMARIZE_FILE',
      userId,
      LoggingType.PAGE,
    );
  }

  async pageAnalyze(html: string, userId: string) {
    let text: string;
    const article = await extractArticleFromHtml(html);
    if (article) {
      text = JSON.stringify(article);
      if (article.image) {
        const response = await gotScraping.get(article.image);
        const fileBuffer = response.rawBody as Buffer;
        const imageName = article.image.split('/').pop();
        const s3Url = await this.fileUpload(fileBuffer, imageName);
      }
    } else {
      text = htmlToText(html) || html;
    }

    if (!text) {
      throw new Error('Content not found');
    }

    text = removeLargeText(text);

    return this.analyzeTextAndGenerateResponse(
      text,
      'SUMMARIZE_FILE',
      userId,
      LoggingType.PAGE,
    );
  }

  async imageAnalyze(file: MultipartFile, userId: string) {
    if (!file.mimetype.includes('image')) {
      throw new Error('This file is not an image');
    }
    const fileBuffer = await file.toBuffer();
    const s3Url = await this.fileUpload(fileBuffer, file.filename);

    let text = '';
    const worker = await createWorker('eng');
    const ret = await worker.recognize(fileBuffer);
    const textArr = [];
    for (let i = 0; i < ret.data.lines.length; i++) {
      if (ret.data.lines[i].confidence > 80)
        textArr.push(ret.data.lines[i].text);
    }
    text = textArr.join();
    await worker.terminate();
    text = removeLargeText(text);

    return this.analyzeTextAndGenerateResponse(
      text,
      'SUMMARIZE_FILE',
      userId,
      LoggingType.IMAGE,
    );
  }

  async getHistory(userId: string) {
    const analysis = await this.prisma.chats.findMany({
      where: { userId, type: ChatType.ANALYTICS },
    });
    const writing = await this.prisma.writeHistory.findMany({
      where: { userId },
    });
    const chats = await this.prisma.chats.findMany({
      where: { userId, type: ChatType.AI_CHAT },
    });
    return { analysis, chats, writing };
  }

  async writing(writingDto: WritingDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const prompt = await this.prisma.openAIPrompts.findUnique({
      where: { name: 'WRITING' },
    });
    const { format, tone, language, length, theme, model } = writingDto;
    const username = user.name || '';
    const context = { format, tone, language, length, username, theme };
    createContext(context);
    const content = runInContext(`\`${prompt.prompt}\``, context);

    const data = { model, messages: [{ role: 'assistant', content }] };
    const openAiResponse = await fetchChatGPT(data);

    setImmediate(async () => {
      await this.prisma.logging.create({
        data: {
          userId,
          request: content,
          response: openAiResponse?.content,
          type: LoggingType.WRITING,
        },
      });
      await this.prisma.writeHistory.create({
        data: {
          userId,
          request: context,
          response: openAiResponse?.content,
        },
      });
    });
    return openAiResponse;
  }

  async fileUpload(fileBuffer: Buffer, filename: string) {
    const config = {
      region: process.env.AWS_REGION,
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `${randomUUID()}-${filename}`,
      Body: fileBuffer,
    };
    const client = new S3Client({ region: config.region });

    const file = await client.send(new PutObjectCommand({ ...config }));

    return `https://${config.Bucket}.s3.amazonaws.com/${config.Key}`;
  }

  async getFilesS3() {
    const config = {
      region: process.env.AWS_REGION,
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
    };
    const client = new S3Client({ region: config.region });
    const input = { Bucket: process.env.AWS_PUBLIC_BUCKET_NAME };
    const command = new ListObjectsV2Command(input);
    const response = await client.send(command);
    return response;
  }
}
