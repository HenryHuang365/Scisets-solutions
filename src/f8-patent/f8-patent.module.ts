import { Module } from '@nestjs/common';
import { F8PatentService } from './f8-patent.service';
import { F8PatentController } from './f8-patent.controller';

@Module({
  controllers: [F8PatentController],
  providers: [F8PatentService],
})
export class F8PatentModule {}
