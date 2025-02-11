import { Module } from '@nestjs/common';
import { F1PublicationsService } from './f1-publications.service';
import { F1PublicationsController } from './f1-publications.controller';

@Module({
  controllers: [F1PublicationsController],
  providers: [F1PublicationsService],
})
export class F1PublicationsModule {}
