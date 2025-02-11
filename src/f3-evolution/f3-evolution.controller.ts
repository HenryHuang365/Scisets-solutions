import { Controller, Get, Query } from '@nestjs/common';
import { F3EvolutionService } from './f3-evolution.service';

@Controller('f3')
export class F3EvolutionController {
  constructor(private readonly f3EvolutionService: F3EvolutionService) {}

  @Get()
  search(@Query('q') query: string, @Query('area') area: string) {
    return this.f3EvolutionService.search(query, area);
  }
}
