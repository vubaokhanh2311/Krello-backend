import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FB_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FB_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FB_PRIVATE_KEY');

    if (
      !projectId ||
      !clientEmail ||
      !privateKey ||
      privateKey.includes('your_firebase_private_key')
    ) {
      this.logger.warn(
        'Firebase environment variables are missing or default placeholders. Skipping Firebase initialization.',
      );
      return;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }
      this.isInitialized = true;
    } catch (error) {
      this.logger.warn(
        `Failed to initialize Firebase Admin SDK: ${(error as Error).message}. Skipping Firebase initialization.`,
      );
    }
  }

  messaging() {
    if (!this.isInitialized || !admin.apps.length) {
      return null;
    }
    return admin.messaging();
  }
}
