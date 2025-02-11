import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto, VerifyOtpDto } from './dto/auth-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserId } from './userId.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('otp')
  async sendOtp(@Body() authLoginDto: AuthLoginDto) {
    try {
      const response = await this.authService.sendOtp(authLoginDto);
      return response;
    } catch (error) {
      return new BadRequestException(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('verifyOtp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async profile(@UserId() userId: string) {
    return this.authService.profile(userId);
  }
}
