import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export enum ChatGptModel {
  GPT3_5 = 'gpt-3.5-turbo-0125',
  ChatGPT4 = 'gpt-4-0125-preview',
}
export class CreateChatDto {
  @ApiProperty({
    enum: ChatGptModel,
    example: ChatGptModel.GPT3_5,
    default: ChatGptModel.GPT3_5,
  })
  @IsNotEmpty()
  @IsEnum(ChatGptModel)
  model: string;
}

export class SendMessageChatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  chatId: string;
}

export class PageAnalyzeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  html: string;
}

export class UrlAnalyzeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  url: string;
}

export enum WritingFormat {
  Auto = 'auto',
  Email = 'email',
  Message = 'message',
  Comment = 'comment',
  Paragraph = 'paragraph',
  Article = 'article',
  BlogPost = 'blogPost',
  Ideas = 'ideas',
  Outline = 'outline',
  Twitter = 'twitter',
}

export enum WritingTone {
  Auto = 'auto',
  Amicable = 'amicable',
  Casual = 'casual',
  Friendly = 'friendly',
  Professional = 'professional',
  Witty = 'witty',
  Funny = 'funny',
  Formal = 'formal',
  Personalized = 'personalized',
}

export enum WritingLength {
  Auto = 'auto',
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
  Travel = 'travel',
}

export enum WritingLanguage {
  EnglishUK = 'English (UK)',
  EnglishUS = 'English (US)',
  ChineseSimplified = 'Chinese (Simplified)',
  ChineseTraditional = 'Chinese (Traditional)',
  Spanish = 'Spanish',
  French = 'French',
}

export class WritingDto {
  @ApiProperty({
    enum: ChatGptModel,
    example: ChatGptModel.GPT3_5,
    default: ChatGptModel.GPT3_5,
  })
  @IsNotEmpty()
  @IsEnum(ChatGptModel)
  model: string;

  @ApiProperty({
    enum: WritingFormat,
    example: WritingFormat.Auto,
    default: WritingFormat.Auto,
  })
  @IsNotEmpty()
  @IsEnum(WritingFormat)
  format: string;

  @ApiProperty({
    enum: WritingTone,
    example: WritingTone.Auto,
    default: WritingTone.Auto,
  })
  @IsNotEmpty()
  @IsEnum(WritingTone)
  tone: WritingTone;

  @ApiProperty({
    enum: WritingLength,
    example: WritingLength.Auto,
    default: WritingLength.Auto,
  })
  @IsNotEmpty()
  @IsEnum(WritingLength)
  length: WritingLength;

  @ApiProperty({
    enum: WritingLanguage,
    example: WritingLanguage.EnglishUK,
    default: WritingLanguage.EnglishUK,
  })
  @IsNotEmpty()
  @IsEnum(WritingLanguage)
  language: WritingLanguage;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  theme: string;
}
