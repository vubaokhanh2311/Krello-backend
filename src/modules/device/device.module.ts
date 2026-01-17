import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceCleanupCron } from './device-cleanup.cron';
@Module({
  providers: [DeviceService, DeviceCleanupCron],
  exports: [DeviceService],
})
export class DeviceModule {}
