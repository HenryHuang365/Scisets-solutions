import { Module } from '@nestjs/common';
import { F7SocialMediaService } from './f7-social-media.service';
import { F7SocialMediaController } from './f7-social-media.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F7SocialMediaController],
  providers: [F7SocialMediaService, PrismaService],
})
export class F7SocialMediaModule {}
