import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { F0AiModule } from './f0-ai/f0-ai.module';
import { F0AiService } from './f0-ai/f0-ai.service';
import { F1PublicationsModule } from './f1-publications/f1-publications.module';
import { F1PublicationsService } from './f1-publications/f1-publications.service';
import { F2AuthorsModule } from './f2-authors/f2-authors.module';
import { F2AuthorsService } from './f2-authors/f2-authors.service';
import { F3EvolutionModule } from './f3-evolution/f3-evolution.module';
import { F3EvolutionService } from './f3-evolution/f3-evolution.service';
import { F4KeyResearchModule } from './f4-key-research/f4-key-research.module';
import { F4KeyResearchService } from './f4-key-research/f4-key-research.service';
import { F5InstitutionModule } from './f5-institution/f5-institution.module';
import { F7SocialMediaModule } from './f7-social-media/f7-social-media.module';
import { F7SocialMediaService } from './f7-social-media/f7-social-media.service';
import { F8PatentModule } from './f8-patent/f8-patent.module';
import { F8PatentService } from './f8-patent/f8-patent.service';
import { AuthModule } from './auth/auth.module';
import { ExtGptModule } from './ext-gpt/ext-gpt.module';
import { OpenAIAssistantModule } from './application/openai-assistant.module';
import { validate } from './env.validation';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { ContextMenuPromptsModule } from './context-menu-prompts/context-menu-prompts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    AuthModule,
    F0AiModule,
    F1PublicationsModule,
    F2AuthorsModule,
    F3EvolutionModule,
    F4KeyResearchModule,
    F5InstitutionModule,
    F7SocialMediaModule,
    F8PatentModule,
    ExtGptModule,
    EmailModule,
    UserModule,
    ContextMenuPromptsModule,
    OpenAIAssistantModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    F0AiService,
    F1PublicationsService,
    F2AuthorsService,
    F3EvolutionService,
    F4KeyResearchService,
    F7SocialMediaService,
    F8PatentService,
    PrismaService,
  ],
})
export class AppModule {}
