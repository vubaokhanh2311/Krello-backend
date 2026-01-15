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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fcmTokens: true },
    });

    if (!user?.fcmTokens?.length) return;

    await this.send(user.fcmTokens, payload);
  }

  async notifyUsers(userIds: string[], payload: NotifyPayload) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { fcmTokens: true },
    });

    const tokens = users.flatMap((u) => u.fcmTokens ?? []);
    if (!tokens.length) return;

    await this.send(tokens, payload);
  }
}
