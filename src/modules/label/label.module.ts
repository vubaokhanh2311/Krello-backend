import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { SocketModule } from '../socket/socket.module';
import { LabelController } from './label.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [LabelController],
  providers: [LabelService],
  exports: [LabelService],
})
export class LabelModule {}
