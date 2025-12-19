import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { SocketModule } from '../socket/socket.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}
