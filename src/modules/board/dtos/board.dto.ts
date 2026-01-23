import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { RoleType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({
    description: 'Name of the board',
    example: 'Project Alpha',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the board',
    example: 'Board for tracking all tasks of Project Alpha',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Background image or color of the board',
    example: '#FF5733',
  })
  @IsOptional()
  background?: string;
}

export class UpdateBoardDto {
  @ApiPropertyOptional({
    description: 'Name of the board',
    example: 'Project Alpha Updated',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the board',
    example: 'Updated board description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Background image or color of the board',
    example: '#33FF57',
  })
  @IsOptional()
  background?: string;
}

export class BoardQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter boards by name',
    example: 'Project Alpha',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter boards by background color or image',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  background?: string;
}

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email of the user to invite to the board',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Role of the invited member',
    enum: RoleType,
    example: RoleType.viewer,
  })
  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType = RoleType.viewer;
}

export class ConfirmInviteDto {
  @ApiProperty({
    example: 'invitation-token-from-email',
    description: 'Board invitation token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RoleDto {
  @ApiProperty({
    description: 'Role of the member',
    enum: RoleType,
    example: RoleType.viewer,
  })
  @IsEnum(RoleType, { message: 'Role must be one of owner, editor, viewer' })
  role: RoleType;
}
