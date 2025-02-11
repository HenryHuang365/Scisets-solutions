import { Controller, Get, Query } from '@nestjs/common';
import { F8PatentService } from './f8-patent.service';

@Controller('f8')
export class F8PatentController {
  constructor(private readonly f8PatentService: F8PatentService) {}

  @Get()
  search(@Query('q') query: string) {
    return this.f8PatentService.search(query);
  }
}
