import { Module } from '@nestjs/common';
import { CardLabelController } from './card-label.controller';
import { CardLabelService } from './card-label.service';
import { SocketModule } from '../socket/socket.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [SocketModule, ActivityModule],
  controllers: [CardLabelController],
  providers: [CardLabelService],
})
export class CardLabelModule {}
