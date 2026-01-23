import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsNotEmpty()
  name: string;
}

export enum DevicePlatform {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'web',
    enum: DevicePlatform,
    description: 'Device platform',
  })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiPropertyOptional({
    example: 'fcm-token-example',
    description: 'Firebase Cloud Messaging token',
  })
  @IsOptional()
  fcmToken?: string;

  @ApiPropertyOptional({
    example: 'device-id-example',
    description: 'Unique device identifier',
  })
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Remember user login (optional)',
  })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user requesting password reset',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-from-email',
    description: 'Password reset token received via email',
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (minimum 6 characters)',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class LoginGoogleDto {
  @ApiProperty({
    example: 'google-oauth-token',
    description: 'Google OAuth token obtained from Google Sign-In',
  })
  @IsString()
  googleToken: string;

  @ApiProperty({
    example: 'web',
    enum: DevicePlatform,
    description: 'Device platform',
  })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiPropertyOptional({
    example: 'device-id-example',
    description: 'Unique device identifier (optional)',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({
    example: 'fcm-token-example',
    description:
      'Firebase Cloud Messaging token for push notifications (optional)',
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
