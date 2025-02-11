import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VoteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'f0',
    'f1',
    'f2',
    'f3',
    'f4',
    'f5',
    'f7',
    'f8',
    'f0 learn more',
    'f2 modal connect',
    'f1 modal analyze',
    'f4 more details',
    'f5 more details',
  ])
  page: string;

  @ApiProperty({ default: true })
  @IsNotEmpty()
  @IsBoolean()
  isLike: boolean = true;
}
