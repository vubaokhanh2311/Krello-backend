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
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { SUCCESS_MESSAGES } from '../../constants/success-messages.constant';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
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
    const cacheKey = `permissions:user:${userId}`;

    // 1️⃣ Kiểm tra cache trước
    const cached = await this.redisService.getCache<string[]>(cacheKey);
    if (cached) return cached;

    // 2️⃣ Lấy quyền từ DB
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

    // 3️⃣ Lấy danh sách mã quyền (code)
    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    // 4️⃣ Lưu cache 1 tiếng (3600s)
    await this.redisService.setCache(cacheKey, permissions, 3600);

    return permissions;
  }

  /**
   * Xoá cache quyền theo userId
   */
  async clearUserPermissionCache(userId: string) {
    const cacheKey = `permissions:user:${userId}`;
    await this.redisService.delCache(cacheKey);
  }

  /**
   * Xoá toàn bộ cache quyền của tất cả user (khi cập nhật quyền lớn)
   */
  async clearAllUserPermissionCache() {
    await this.redisService.delByPattern('permissions:user:*');
  }
}
