import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiQuery } from '@nestjs/swagger';
import { VoteDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiQuery({
    name: 'f',
    example: 'f1,f3',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @Get('search')
  search(
    @Query('q') query: string,
    @Query('f') stage: string,
    @Query('page') page: string,
  ) {
    return this.appService.search(query, stage, parseInt(page) || 1);
  }

  @Post('vote')
  like(@Body() vote: VoteDto) {
    return this.appService.vote(vote);
  }
}
