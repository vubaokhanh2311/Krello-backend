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

    // Merge data + title + body
    const rawData = {
      title: payload.title,
      body: payload.body,
      ...(payload.data ?? {}),
    };

    // Convert all values to string
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawData)) {
      data[key] = String(value);
    }

    const message: MulticastMessage = {
      tokens,
      data,

      // IMPORTANT: Web FCM requires webpush config
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title: data.title,
          body: data.body,
          icon: '/logo.png',
        },
      },
    };

    const res = await this.firebase.messaging().sendEachForMulticast(message);

    console.log('🔥 FCM TOKENS:', tokens);
    console.log('🔥 FCM PAYLOAD:', message);
    console.log('🔥 FCM RESPONSE:', JSON.stringify(res, null, 2));
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
