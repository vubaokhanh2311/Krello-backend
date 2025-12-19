import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  CommentQueryDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dtos/comment.dto';
import {
  SUCCESS_MESSAGES,
  ROLETYPE,
  ERROR_MESSAGES,
} from '../../constants/index';
import {
  getPagination,
  parseOrder,
  parseSelectFields,
  checkBoardAccess,
  buildMeta,
} from '../../common/utils/index';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
  ) {}

  async findAll(cardId: string, userId: string, query: CommentQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, card.list.boardId, userId);

    const where: any = { cardId };

    if (query.content) {
      where.content = { contains: query.content, mode: 'insensitive' };
    }

    const orderBy = parseOrder(query.order);
    const baseSelect = parseSelectFields(query.fields, {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    });
    const select = {
      ...baseSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      card: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({ where, skip, take, orderBy, select }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(userId: string, cardId: string, dto: CreateCommentDto) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    const boardId = card.list.boardId;
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    const comment = await this.prisma.comment.create({
      data: {
        ...dto,
        cardId,
        userId: userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        card: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    void this.socketEvents.emitCommentCreated(boardId, cardId, comment);
    void this.activityService.logCommentCreated(
      boardId,
      cardId,
      comment.id,
      userId,
    );
    return comment;
  }

  async update(
    userId: string,
    commentId: string,
    cardId: string,
    dto: UpdateCommentDto,
  ) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, card.list.boardId, userId, [
      ROLETYPE.EDITOR,
    ]);

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT.NOT_FOUND);
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.NOT_FOUND_UPDATE);
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { ...dto },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        card: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    void this.socketEvents.emitCommentUpdated(
      card.list.boardId,
      cardId,
      commentId,
      updated,
    );
    void this.activityService.logCommentUpdated(
      card.list.boardId,
      cardId,
      commentId,
      userId,
    );
    return updated;
  }

  async remove(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        card: {
          select: {
            id: true,
            list: {
              select: {
                boardId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(ERROR_MESSAGES.COMMENT.NOT_FOUND);
    }

    const boardId = comment.card.list.boardId;
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    if (comment.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.NOT_FOUND_UPDATE);
    }
    const cardId = comment.card.id;
    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    void this.socketEvents.emitCommentDeleted(boardId, cardId, commentId);
    void this.activityService.logCommentDeleted(
      boardId,
      cardId,
      commentId,
      userId,
    );

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
