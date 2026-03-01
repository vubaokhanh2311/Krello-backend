import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Device } from '@prisma/client';
import { CreateDeviceDto } from './dtos/create-device.dto';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateDeviceDto): Promise<Device> {
    return this.prisma.device.create({
      data: {
        userId: dto.userId,
        jti: dto.jti,
        platform: dto.platform,
        refreshTokenExp: dto.refreshTokenExp,
        fcmToken: dto.fcmToken,
        deviceId: dto.deviceId,
      },
    });
  }

  async deleteByJti(jti: string) {
    await this.prisma.device.deleteMany({
      where: { jti },
    });

    return true;
  }

  deleteExpired(): Promise<{ count: number }> {
    return this.prisma.device.deleteMany({
      where: {
        refreshTokenExp: {
          lt: new Date(),
        },
      },
    });
  }

  findValidByUser(userId: string): Promise<Device[]> {
    return this.prisma.device.findMany({
      where: {
        userId,
        refreshTokenExp: {
          gt: new Date(),
        },
      },
    });
  }
}
