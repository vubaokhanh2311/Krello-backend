import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCardMenberDto } from './dtos/card-member.dto';
import { ERROR_MESSAGES } from 'src/constants/error-messages.constant';

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
            board: {
              select: {
                id: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    const board = card.list.board;

    if (board.ownerId !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.ACCESS_DENIED);
    }

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

  async remove(userId: string, cardMemberId: string) {
    const cardMember = await this.prisma.cardMember.findUnique({
      where: { id: cardMemberId },
      select: {
        card: {
          select: {
            list: {
              select: {
                board: {
                  select: {
                    id: true,
                    ownerId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cardMember) {
      throw new NotFoundException(ERROR_MESSAGES.CARD_MEMBER.NOT_FOUND);
    }

    const isOwner = cardMember.card.list.board.ownerId === userId;
    if (!isOwner) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.ACCESS_DENIED);
    }

    return this.prisma.cardMember.delete({
      where: { id: cardMemberId },
    });
  }
}
