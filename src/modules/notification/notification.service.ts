import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';
import { MulticastMessage } from 'firebase-admin/messaging';
import { NotifyPayload } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  private async send(tokens: string[], payload: NotifyPayload) {
    if (!tokens.length) return;

    const message: MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    };

    await this.firebase.messaging().sendEachForMulticast(message);
  }

  async notifyUser(userId: string, payload: NotifyPayload) {
    const devices = await this.prisma.device.findMany({
      where: {
        userId,
        fcmToken: { not: null },
        refreshTokenExp: { gt: new Date() },
      },
      select: { fcmToken: true },
    });

    const tokens = devices
      .map((d) => d.fcmToken)
      .filter((t): t is string => Boolean(t));

    if (!tokens.length) return;

    await this.send(tokens, payload);
  }

  async notifyUsers(userIds: string[], payload: NotifyPayload) {
    const devices = await this.prisma.device.findMany({
      where: {
        userId: { in: userIds },
        fcmToken: { not: null },
        refreshTokenExp: { gt: new Date() },
      },
      select: { fcmToken: true },
    });

    const tokens = devices
      .map((d) => d.fcmToken)
      .filter((t): t is string => Boolean(t));

    if (!tokens.length) return;

    await this.send(tokens, payload);
  }
}
