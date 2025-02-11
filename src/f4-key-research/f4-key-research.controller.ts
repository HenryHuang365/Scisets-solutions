import { Controller, Get, Query } from '@nestjs/common';
import { F4KeyResearchService } from './f4-key-research.service';

@Controller('f4')
export class F4KeyResearchController {
  constructor(private readonly f4KeyResearchService: F4KeyResearchService) {}

  @Get()
  search(@Query('area') area: string) {
    return this.f4KeyResearchService.search(area);
  }
}
