import { Module } from '@nestjs/common';
import { CardMemberController } from './card-member.controller';
import { CardMemberService } from './card-member.service';
import { SocketModule } from '../socket/socket.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [CardMemberController],
  providers: [CardMemberService],
})
export class CardMemberModule {}
