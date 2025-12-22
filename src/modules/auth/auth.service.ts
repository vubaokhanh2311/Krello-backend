import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenService } from './jwt-token.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RedisService } from '../../shared/redis/redis.service';
import { OAuth2Client } from 'google-auth-library';
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  USER_PERMISSIONS,
} from '../../constants/index';

import { genUserPermissionKey } from '../../helpers/gen-key.helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
  ) {}
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        password: hashedPassword as string,
        salt,
      },
    });

    const { password, salt: _, ...safeUser } = newUser;
    return safeUser;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException(
        ERROR_MESSAGES.AUTH.EMAIL_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatch = await bcrypt.compare(password + user.salt, user.password);
    if (!isMatch) {
      throw new HttpException(
        ERROR_MESSAGES.AUTH.INVALID_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const roleName = user.role?.name ?? null;
    const permissionCodes =
      user.role?.permissions.map((rp) => rp.permission.code) ?? [];

    const tokens = await this.jwtTokenService.generateTokenPair({
      uid: user.id,
      role: roleName,
    });

    return {
      ...tokens,
      role: roleName,
      permissions: permissionCodes,
    };
  }

  async logout(payload: JwtPayload) {
    await this.jwtTokenService.revokeToken(payload.jti);
    return { message: SUCCESS_MESSAGES.AUTH.LOGOUT };
  }

  async getPermissionsByUser(userId: string): Promise<string[]> {
    const cacheKey = genUserPermissionKey(userId);

    const cached = await this.redisService.getCache<string[]>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: String(userId) },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user?.role) return [];

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    await this.redisService.setCache(cacheKey, permissions, USER_PERMISSIONS);

    return permissions;
  }

  async clearUserPermissionCache(userId: string) {
    const cacheKey = genUserPermissionKey(userId);

    await this.redisService.delCache(cacheKey);
  }

  async clearAllUserPermissionCache() {
    await this.redisService.delByPattern('permissions:user:*');
  }

  async loginWithGoogle(googleToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: googleToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new HttpException(
        ERROR_MESSAGES.AUTH.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name ?? email.split('@')[0],
          avatarUrl: picture,
          googleId,
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });
    }

    if (!user) {
      throw new HttpException(
        ERROR_MESSAGES.AUTH.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.googleId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const roleName = user.role?.name ?? null;
    const permissions =
      user.role?.permissions.map((rp) => rp.permission.code) ?? [];

    const tokens = await this.jwtTokenService.generateTokenPair({
      uid: user.id,
      role: roleName,
    });

    return {
      ...tokens,
      role: roleName,
      permissions,
    };
  }
}
