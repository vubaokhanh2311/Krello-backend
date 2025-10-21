import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { UpdateProfileDto } from './dtos/user.dto';
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
}
