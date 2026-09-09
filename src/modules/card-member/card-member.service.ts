import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCardMenberDto } from './dtos/card-member.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/index';

import { checkBoardAccess } from '../../common/utils/index';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CardMemberService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
  ) {}
  async create(userId: string, cardId: string, dto: CreateCardMenberDto) {
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
    await checkBoardAccess(this.prisma, boardId, userId, [], true);

    const existingMember = await this.prisma.cardMember.findUnique({
      where: {
        cardId_userId: {
          cardId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.MEMBER_ALREADY_EXISTS);
    }

    const member = await this.prisma.cardMember.create({
      data: {
        cardId,
        userId: dto.userId,
      },
      select: {
        id: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.socketEvents.emitCardMemberAdded(boardId, cardId, {
      userId: dto.userId,
      memberId: member.id,
      user: member.user,
    });
    void this.activityService.logCardMemberAdded(
      boardId,
      cardId,
      dto.userId,
      userId,
    );

    return member;
  }

  async remove(userId: string, memberUserId: string, cardId: string) {
    const cardMember = await this.prisma.cardMember.findFirst({
      where: { userId: memberUserId, cardId },
      select: {
        id: true,
        card: {
          select: {
            list: {
              select: {
                boardId: true,
              },
            },
          },
        },
      },
    });

    if (!cardMember) {
      throw new NotFoundException(ERROR_MESSAGES.CARD_MEMBER.NOT_FOUND);
    }

    const boardId = cardMember.card.list.boardId;

    await checkBoardAccess(this.prisma, boardId, userId, [], true);

    await this.prisma.cardMember.delete({
      where: { id: cardMember.id },
    });

    this.socketEvents.emitCardMemberRemoved(boardId, cardId, {
      userId: memberUserId,
      memberId: cardMember.id,
    });
    void this.activityService.logCardMemberRemoved(
      boardId,
      cardId,
      memberUserId,
      userId,
    );

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
