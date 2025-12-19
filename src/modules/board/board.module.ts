import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { SocketModule } from '../socket/socket.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
