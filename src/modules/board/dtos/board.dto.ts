import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { RoleType } from '@prisma/client';
export class CreateBoardDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  background?: string;
}

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  background?: string;
}

export class BoardQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  background?: string;
}

export class InviteMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType = RoleType.viewer;
}
