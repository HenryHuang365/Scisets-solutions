import {
  BadRequestException,
  Body,
  Controller,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserId } from 'src/auth/userId.decorator';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put()
  async sendMessage(@Body() updateUserDto: UpdateUserDto, @UserId() userId) {
    try {
      const response = await this.userService.update(updateUserDto, userId);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }
}
