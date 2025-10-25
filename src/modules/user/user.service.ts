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
} from './dtos/user.dto';
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

  async findAll(query: { page?: number; pageSize?: number }) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
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
    const hashedPassword = await bcrypt.hash(userData.password + salt, 10);

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
}
