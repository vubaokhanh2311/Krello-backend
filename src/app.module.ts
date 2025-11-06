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
@Module({
  imports: [
    SharedModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    BoardModule,
    ListModule,
    CardModule,
    CardMemberModule,
    LabelModule,
    CardLabelModule,
    AttachmentModule,
    CommentModule,
  ],
  controllers: [AppController, UserController, ListController, CardController, LabelController, CardLabelController],
  providers: [AppService, UserService, ListService, CardService, CardLabelService],
})
export class AppModule {}
