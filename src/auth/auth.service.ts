import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto, VerifyOtpDto } from './dto/auth-login.dto';
import { PrismaService } from 'src/prisma.service';
import { randomInt } from 'node:crypto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: { Otp: true },
    });
  }

  private validateOtpCode(user, code: string) {
    if (!user.Otp) {
      throw new BadRequestException('Incorrect code');
    }

    const isNotValidCode = code !== user.Otp.code;
    const isUsed = user.Otp.used;
    const OTP_EXPIRES_MS = Number(process.env.OTP_EXPIRES_MS);
    const isExpiredCode =
      user.Otp.updateAt.getTime() + OTP_EXPIRES_MS < Date.now();

    if (isUsed) {
      throw new BadRequestException('Code is used');
    }
    if (isNotValidCode) {
      throw new BadRequestException('Invalid code');
    }
    if (isExpiredCode) {
      throw new UnauthorizedException('Code is expired');
    }
  }

  async sendOtp(authLoginDto: AuthLoginDto) {
    const { email } = authLoginDto;

    const foundUser = await this.getUserByEmail(email);

    const user =
      foundUser || (await this.prisma.user.create({ data: { email } }));

    const code = randomInt(1000, 9999).toString();
    await this.prisma.otp.upsert({
      where: { userId: user.id },
      update: { code, used: false },
      create: { code, user: { connect: { id: user.id } } },
    });

    await this.emailService.sendVerificationCodeFromEmail(email, code);

    return user;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    const user = await this.getUserByEmail(email);

    this.validateOtpCode(user, code);

    await this.prisma.otp.update({
      where: { userId: user.id },
      data: { used: true },
    });

    const payload = { userId: user.id };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async profile(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }
}
