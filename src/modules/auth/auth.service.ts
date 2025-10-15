import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    userData: RegisterDto,
  ): Promise<Omit<User, 'password' | 'salt'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      throw new HttpException(
        ERROR_MESSAGES.AUTH.EMAIL_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const salt = randomBytes(5).toString('hex');
    const hashedPassword = await bcrypt.hash(userData.password + salt, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        salt,
      },
    });

    const { password, salt: _, ...safeUser } = newUser;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException(
        ERROR_MESSAGES.AUTH.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );

    const isMatch = await bcrypt.compare(password + user.salt, user.password);
    if (!isMatch)
      throw new HttpException(
        ERROR_MESSAGES.AUTH.INVALID_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    const payload: JwtPayload = {
      uid: String(user.id),
      jti: randomUUID(),
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.config.get<string>('ACCESS_TOKEN_KEY') ?? 'default_access_secret',
      expiresIn: (this.config.get<string>('ACCESS_TOKEN_EXPIRES_IN') ??
        '1h') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.config.get<string>('REFRESH_TOKEN_KEY') ??
        'default_refresh_secret',
      expiresIn: (this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN') ??
        '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
