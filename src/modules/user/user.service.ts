import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { UpdateAvatarDto } from './dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import {
  UpdateProfileDto,
  UpdateUserDto,
  CreateUserDto,
  UserQueryDto,
} from './dtos/user.dto';
import {
  getPagination,
  parseOrder,
  parseSelectFields,
  buildMeta,
} from '../../common/utils/index';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

    return user;
  }

  async updateProfile(userId: string, DataProfileDto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: DataProfileDto.name, email: DataProfileDto.email },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  }

  async updateAvatar(userId: string, dto: UpdateAvatarDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: dto.avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }

  async findAll(query: UserQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const where: any = {};
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }

    const orderBy = parseOrder(query.order);

    const select = parseSelectFields(query.fields, {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      roleId: true,
      createdAt: true,
      updatedAt: true,
    });

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        select,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
    }
    const salt = randomBytes(5).toString('hex');
    const hashedPassword = await bcrypt.hash(dto.password + salt, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword as string,
        salt,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        roleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      if (dto.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: dto.email },
        });

        if (existingUser && existingUser.id !== id) {
          throw new ForbiddenException(
            ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS,
          );
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: dto,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND_UPDATE);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { deleted: true };
    } catch (error) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND_DELETE);
    }
  }

  async addFcmToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user) return;

    if (!user.fcmTokens?.includes(token)) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          fcmTokens: {
            push: token,
          },
        },
      });
    }
  }
  async removeFcmToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user?.fcmTokens?.length) return;

    const newTokens = user.fcmTokens.filter((t) => t !== token);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fcmTokens: {
          set: newTokens,
        },
      },
    });
  }
}
