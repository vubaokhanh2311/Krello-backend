import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeviceService } from './device.service';

@Injectable()
export class DeviceCleanupCron {
  private readonly logger = new Logger(DeviceCleanupCron.name);

  constructor(private readonly deviceService: DeviceService) {}

  @Cron('*/10 * * * *')
  async clearExpiredDevices() {
    const result = await this.deviceService.deleteExpired();

    if (result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired devices`);
    }
  }
}
