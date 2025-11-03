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
  ],
  controllers: [AppController, UserController, ListController, CardController],
  providers: [AppService, UserService, ListService, CardService],
})
export class AppModule {}
