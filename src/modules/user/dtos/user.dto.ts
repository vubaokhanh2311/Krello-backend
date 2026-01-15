import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Vu Bao Khanh',
    description: 'User name',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'khanh@example.com',
    description: 'User email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateAvatarDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'User avatar (optional)',
  })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  avatarUrl: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'User name',
  })
  name?: string;

  @ApiPropertyOptional({
    example: 'a@example.com',
    description: 'User email',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'admin',
    description: 'User role ID or role name',
  })
  roleId?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'User avatar (optional)',
  })
  avatar?: any;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyen Van B', description: 'User name' })
  name: string;

  @ApiProperty({ example: 'b@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: '123456', description: 'User password' })
  password: string;

  @ApiPropertyOptional({
    example: 'member',
    description: 'User role ID or name (optional)',
  })
  roleId?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Avatar image (optional)',
  })
  avatar?: any;
}

export class UserQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Khanh', description: 'Filter by name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '@gmail.com',
    description: 'Filter by email (partial match)',
  })
  @IsOptional()
  @IsString()
  email?: string;
}

export class SaveFcmTokenDto {
  @IsString()
  token: string;
}
