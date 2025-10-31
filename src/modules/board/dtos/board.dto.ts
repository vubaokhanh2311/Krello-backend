import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
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
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType = RoleType.viewer;
}
