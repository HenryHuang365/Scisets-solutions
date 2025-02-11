import { Controller, Get, Query } from '@nestjs/common';
import { F0AiService } from './f0-ai.service';

@Controller('f0')
export class F0AiController {
  constructor(private readonly f0AiService: F0AiService) {}

  @Get()
  search(@Query('q') query: string) {
    return this.f0AiService.search(query);
  }
}
