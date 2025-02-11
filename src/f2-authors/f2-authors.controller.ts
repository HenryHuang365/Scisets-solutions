import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { F2AuthorsService } from './f2-authors.service';

@Controller('f2')
export class F2AuthorsController {
  constructor(private readonly f2AuthorsService: F2AuthorsService) {}

  @Get()
  search(@Query('q') query: string, @Query('page', ParseIntPipe) page: number) {
    return this.f2AuthorsService.search(query, page);
  }
}
