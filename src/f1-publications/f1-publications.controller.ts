import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { F1PublicationsService } from './f1-publications.service';

@Controller('f1')
export class F1PublicationsController {
  constructor(private readonly f1PublicationsService: F1PublicationsService) {}

  @Get()
  search(@Query('q') query: string, @Query('page', ParseIntPipe) page: number) {
    return this.f1PublicationsService.search(query, page);
  }
}
