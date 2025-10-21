import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

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
