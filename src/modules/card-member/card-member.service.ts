import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCardMenberDto } from './dtos/card-member.dto';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from 'src/constants/index';

import { checkBoardAccess } from '../../common/utils/index';
@Injectable()
export class CardMemberService {
  constructor(private prisma: PrismaService) {}
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

    return this.prisma.cardMember.create({
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

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
