import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { RegisterDto } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    userData: RegisterDto,
  ): Promise<Omit<User, 'password' | 'salt'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      throw new HttpException('Email đã được sử dụng', HttpStatus.BAD_REQUEST);
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
}
