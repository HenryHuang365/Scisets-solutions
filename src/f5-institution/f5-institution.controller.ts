import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { F5InstitutionService } from './f5-institution.service';

@Controller('f5')
export class F5InstitutionController {
  constructor(private readonly f5InstitutionService: F5InstitutionService) {}

  @Get()
  search(@Query('page', ParseIntPipe) page: number) {
    return this.f5InstitutionService.search(page);
  }
}
