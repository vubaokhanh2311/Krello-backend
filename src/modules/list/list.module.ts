import { Module } from '@nestjs/common';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { SocketModule } from '../socket/socket.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
