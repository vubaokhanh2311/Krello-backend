import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateProfileDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateAvatarDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  avatarUrl: string;
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  roleId?: string;
}

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  roleId?: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
