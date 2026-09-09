import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { BoardModule } from './modules/board/board.module';
import { ListModule } from './modules/list/list.module';
import { CardModule } from './modules/card/card.module';
import { CardMemberModule } from './modules/card-member/card-member.module';
import { LabelModule } from './modules/label/label.module';
import { CardLabelModule } from './modules/card-label/card-label.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { CommentModule } from './modules/comment/comment.module';
import { UnsplashModule } from './modules/unsplash/unsplash.module';
import { HttpModule } from '@nestjs/axios';
import { SocketModule } from './modules/socket/socket.module';
import { ActivityModule } from './modules/activity/activity.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DeviceModule } from './modules/device/device.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    SharedModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          app: {
            name: process.env.APP_NAME,
            globalPrefix: process.env.APP_GLOBAL_PREFIX || 'api',
          },
          swagger: {
            enable: process.env.SWAGGER_ENABLE === 'true',
            path: process.env.SWAGGER_PATH || 'api-docs',
            serverUrl:
              process.env.SWAGGER_SERVER_URL || 'http://localhost:3000',
          },
        }),
      ],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    BoardModule,
    ListModule,
    CardModule,
    CardMemberModule,
    LabelModule,
    CardLabelModule,
    AttachmentModule,
    CommentModule,
    UnsplashModule,
    HttpModule,
    SocketModule,
    ActivityModule,
    FirebaseModule,
    NotificationModule,
    DeviceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,

      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
