import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityAction {
  BOARD_CREATED = 'board:created',
  BOARD_UPDATED = 'board:updated',
  BOARD_DELETED = 'board:deleted',
  BOARD_MEMBER_ADDED = 'board:member:added',
  BOARD_MEMBER_REMOVED = 'board:member:removed',
  BOARD_MEMBER_ROLE_UPDATED = 'board:member:role:updated',
  LIST_CREATED = 'list:created',
  LIST_UPDATED = 'list:updated',
  LIST_DELETED = 'list:deleted',
  LIST_MOVED = 'list:moved',
  CARD_CREATED = 'card:created',
  CARD_UPDATED = 'card:updated',
  CARD_DELETED = 'card:deleted',
  CARD_MOVED = 'card:moved',
  CARD_MEMBER_ADDED = 'card:member:added',
  CARD_MEMBER_REMOVED = 'card:member:removed',
  COMMENT_CREATED = 'comment:created',
  COMMENT_UPDATED = 'comment:updated',
  COMMENT_DELETED = 'comment:deleted',
  ATTACHMENT_ADDED = 'attachment:added',
  ATTACHMENT_DELETED = 'attachment:deleted',
  LABEL_CREATED = 'label:created',
  LABEL_UPDATED = 'label:updated',
  LABEL_DELETED = 'label:deleted',
  CARD_LABEL_ADDED = 'card:label:added',
  CARD_LABEL_REMOVED = 'card:label:removed',
}

export enum ActivityTargetType {
  BOARD = 'board',
  LIST = 'list',
  CARD = 'card',
  COMMENT = 'comment',
  ATTACHMENT = 'attachment',
  LABEL = 'label',
  CARD_LABEL = 'card_label',
  BOARD_MEMBER = 'board_member',
  CARD_MEMBER = 'card_member',
}

export class ActivityQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter activities by action',
    enum: ActivityAction,
  })
  @IsOptional()
  @IsEnum(ActivityAction)
  action?: ActivityAction;

  @ApiPropertyOptional({
    description: 'Filter activities by target type',
    enum: ActivityTargetType,
  })
  @IsOptional()
  @IsEnum(ActivityTargetType)
  targetType?: ActivityTargetType;

  @ApiPropertyOptional({
    description: 'Filter activities by target ID',
  })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({
    description: 'Filter activities by user ID',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class CreateActivityDto {
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  boardId: string;
  userId: string;
}

