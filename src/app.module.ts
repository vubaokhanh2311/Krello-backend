import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { BoardModule } from './modules/board/board.module';
import { ListService } from './modules/list/list.service';
import { ListController } from './modules/list/list.controller';
import { ListModule } from './modules/list/list.module';
import { CardService } from './modules/card/card.service';
import { CardController } from './modules/card/card.controller';
import { CardModule } from './modules/card/card.module';
import { CardMemberModule } from './modules/card-member/card-member.module';
import { LabelController } from './modules/label/label.controller';
import { LabelModule } from './modules/label/label.module';
import { CardLabelService } from './modules/card-label/card-label.service';
import { CardLabelController } from './modules/card-label/card-label.controller';
import { CardLabelModule } from './modules/card-label/card-label.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { CommentModule } from './modules/comment/comment.module';
import { UnsplashController } from './modules/unsplash/unsplash.controller';
import { UnsplashService } from './modules/unsplash/unsplash.service';
import { UnsplashModule } from './modules/unsplash/unsplash.module';
import { HttpModule } from '@nestjs/axios';
import { SocketModule } from './modules/socket/socket.module';
import { ActivityModule } from './modules/activity/activity.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { NotificationService } from './modules/notification/notification.service';
import { NotificationModule } from './modules/notification/notification.module';
import { DeviceService } from './modules/device/device.service';
import { DeviceModule } from './modules/device/device.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
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
  controllers: [
    AppController,
    UserController,
    ListController,
    CardController,
    LabelController,
    CardLabelController,
    UnsplashController,
  ],
  providers: [
    AppService,
    UserService,
    ListService,
    CardService,
    CardLabelService,
    UnsplashService,
    NotificationService,
    DeviceService,
  ],
})
export class AppModule {}
