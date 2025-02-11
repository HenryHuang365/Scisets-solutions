import { Module } from '@nestjs/common';
import { F5InstitutionService } from './f5-institution.service';
import { F5InstitutionController } from './f5-institution.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [F5InstitutionController],
  providers: [F5InstitutionService, PrismaService],
})
export class F5InstitutionModule {}
