import { Module } from '@nestjs/common';
import { SocketModule } from '../socket/socket.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
