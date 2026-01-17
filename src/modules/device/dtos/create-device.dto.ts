import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export enum DevicePlatform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

export class CreateDeviceDto {
  @IsString()
  userId: string;

  @IsString()
  jti: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsDate()
  refreshTokenExp: Date;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
