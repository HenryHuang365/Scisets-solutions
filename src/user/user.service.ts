import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  update(updateUserDto: UpdateUserDto, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { ...updateUserDto },
    });
  }
}
