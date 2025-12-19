import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  ActivityQueryDto,
  CreateActivityDto,
  ActivityAction,
  ActivityTargetType,
} from './dtos/activity.dto';
import {
  getPagination,
  parseOrder,
  parseSelectFields,
  checkBoardAccess,
  buildMeta,
} from '../../common/utils/index';
import { SocketEventsService } from '../socket/socket-events.service';

@Injectable()
export class ActivityService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
  ) {}

  async findAll(boardId: string, userId: string, query: ActivityQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    await checkBoardAccess(this.prisma, boardId, userId);

    const where: any = { boardId };

    if (query.action) {
      where.action = query.action;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }
    if (query.targetId) {
      where.targetId = query.targetId;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const orderBy = parseOrder(query.order) || { createdAt: 'desc' };

    const selectFields = parseSelectFields(query.fields, {
      id: true,
      action: true,
      targetType: true,
      targetId: true,
      createdAt: true,
    });

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          ...selectFields,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        action: dto.action,
        targetType: dto.targetType,
        targetId: dto.targetId,
        boardId: dto.boardId,
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Emit activity to socket
    this.socketEvents.emitActivity(dto.boardId, activity);

    return activity;
  }

  // Helper methods for common activities
  async logBoardCreated(boardId: string, userId: string) {
    return this.create({
      action: ActivityAction.BOARD_CREATED,
      targetType: ActivityTargetType.BOARD,
      targetId: boardId,
      boardId,
      userId,
    });
  }

  async logBoardUpdated(boardId: string, userId: string) {
    return this.create({
      action: ActivityAction.BOARD_UPDATED,
      targetType: ActivityTargetType.BOARD,
      targetId: boardId,
      boardId,
      userId,
    });
  }

  async logBoardDeleted(boardId: string, userId: string) {
    return this.create({
      action: ActivityAction.BOARD_DELETED,
      targetType: ActivityTargetType.BOARD,
      targetId: boardId,
      boardId,
      userId,
    });
  }

  async logListCreated(boardId: string, listId: string, userId: string) {
    return this.create({
      action: ActivityAction.LIST_CREATED,
      targetType: ActivityTargetType.LIST,
      targetId: listId,
      boardId,
      userId,
    });
  }

  async logListUpdated(boardId: string, listId: string, userId: string) {
    return this.create({
      action: ActivityAction.LIST_UPDATED,
      targetType: ActivityTargetType.LIST,
      targetId: listId,
      boardId,
      userId,
    });
  }

  async logListDeleted(boardId: string, listId: string, userId: string) {
    return this.create({
      action: ActivityAction.LIST_DELETED,
      targetType: ActivityTargetType.LIST,
      targetId: listId,
      boardId,
      userId,
    });
  }

  async logCardCreated(boardId: string, cardId: string, userId: string) {
    return this.create({
      action: ActivityAction.CARD_CREATED,
      targetType: ActivityTargetType.CARD,
      targetId: cardId,
      boardId,
      userId,
    });
  }

  async logCardUpdated(boardId: string, cardId: string, userId: string) {
    return this.create({
      action: ActivityAction.CARD_UPDATED,
      targetType: ActivityTargetType.CARD,
      targetId: cardId,
      boardId,
      userId,
    });
  }

  async logCardDeleted(boardId: string, cardId: string, userId: string) {
    return this.create({
      action: ActivityAction.CARD_DELETED,
      targetType: ActivityTargetType.CARD,
      targetId: cardId,
      boardId,
      userId,
    });
  }

  async logCommentCreated(
    boardId: string,
    cardId: string,
    commentId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.COMMENT_CREATED,
      targetType: ActivityTargetType.COMMENT,
      targetId: commentId,
      boardId,
      userId,
    });
  }

  async logCommentUpdated(
    boardId: string,
    cardId: string,
    commentId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.COMMENT_UPDATED,
      targetType: ActivityTargetType.COMMENT,
      targetId: commentId,
      boardId,
      userId,
    });
  }

  async logCommentDeleted(
    boardId: string,
    cardId: string,
    commentId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.COMMENT_DELETED,
      targetType: ActivityTargetType.COMMENT,
      targetId: commentId,
      boardId,
      userId,
    });
  }

  async logAttachmentAdded(
    boardId: string,
    cardId: string,
    attachmentId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.ATTACHMENT_ADDED,
      targetType: ActivityTargetType.ATTACHMENT,
      targetId: attachmentId,
      boardId,
      userId,
    });
  }

  async logAttachmentDeleted(
    boardId: string,
    cardId: string,
    attachmentId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.ATTACHMENT_DELETED,
      targetType: ActivityTargetType.ATTACHMENT,
      targetId: attachmentId,
      boardId,
      userId,
    });
  }

  async logLabelCreated(boardId: string, labelId: string, userId: string) {
    return this.create({
      action: ActivityAction.LABEL_CREATED,
      targetType: ActivityTargetType.LABEL,
      targetId: labelId,
      boardId,
      userId,
    });
  }

  async logLabelUpdated(boardId: string, labelId: string, userId: string) {
    return this.create({
      action: ActivityAction.LABEL_UPDATED,
      targetType: ActivityTargetType.LABEL,
      targetId: labelId,
      boardId,
      userId,
    });
  }

  async logLabelDeleted(boardId: string, labelId: string, userId: string) {
    return this.create({
      action: ActivityAction.LABEL_DELETED,
      targetType: ActivityTargetType.LABEL,
      targetId: labelId,
      boardId,
      userId,
    });
  }

  async logCardLabelAdded(
    boardId: string,
    cardId: string,
    labelId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.CARD_LABEL_ADDED,
      targetType: ActivityTargetType.CARD_LABEL,
      targetId: `${cardId}:${labelId}`,
      boardId,
      userId,
    });
  }

  async logCardLabelRemoved(
    boardId: string,
    cardId: string,
    labelId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.CARD_LABEL_REMOVED,
      targetType: ActivityTargetType.CARD_LABEL,
      targetId: `${cardId}:${labelId}`,
      boardId,
      userId,
    });
  }

  async logBoardMemberAdded(
    boardId: string,
    memberUserId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.BOARD_MEMBER_ADDED,
      targetType: ActivityTargetType.BOARD_MEMBER,
      targetId: memberUserId,
      boardId,
      userId,
    });
  }

  async logBoardMemberRemoved(
    boardId: string,
    memberUserId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.BOARD_MEMBER_REMOVED,
      targetType: ActivityTargetType.BOARD_MEMBER,
      targetId: memberUserId,
      boardId,
      userId,
    });
  }

  async logCardMemberAdded(
    boardId: string,
    cardId: string,
    memberUserId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.CARD_MEMBER_ADDED,
      targetType: ActivityTargetType.CARD_MEMBER,
      targetId: `${cardId}:${memberUserId}`,
      boardId,
      userId,
    });
  }

  async logCardMemberRemoved(
    boardId: string,
    cardId: string,
    memberUserId: string,
    userId: string,
  ) {
    return this.create({
      action: ActivityAction.CARD_MEMBER_REMOVED,
      targetType: ActivityTargetType.CARD_MEMBER,
      targetId: `${cardId}:${memberUserId}`,
      boardId,
      userId,
    });
  }
}

