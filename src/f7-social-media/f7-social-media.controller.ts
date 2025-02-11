import { Controller, Get, Query } from '@nestjs/common';
import { F7SocialMediaService } from './f7-social-media.service';

@Controller('f7')
export class F7SocialMediaController {
  constructor(private readonly f7SocialMediaService: F7SocialMediaService) {}

  @Get()
  search(@Query('area') area: string) {
    return this.f7SocialMediaService.search(area);
  }
}
