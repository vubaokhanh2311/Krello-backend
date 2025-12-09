import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCardLabelDto } from './dtos/card-label.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROLETYPE,
} from 'src/constants/index';

import { checkBoardAccess } from '../../common/utils/index';
@Injectable()
export class CardLabelService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, cardId: string, dto: CreateCardLabelDto) {
    // 1. Check card exists
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        list: { select: { boardId: true } },
      },
    });

    if (!card) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    // 2. Check label exists
    const label = await this.prisma.label.findUnique({
      where: { id: dto.labelId },
      select: { id: true },
    });

    if (!label) {
      throw new NotFoundException(ERROR_MESSAGES.LABEL.NOT_FOUND);
    }

    // 3. Check access rights
    const boardId = card.list.boardId;
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    return this.prisma.cardLabel.upsert({
      where: {
        cardId_labelId: {
          cardId,
          labelId: dto.labelId,
        },
      },
      create: {
        cardId,
        labelId: dto.labelId,
      },
      update: {}, // No update needed
      select: {
        card: {
          select: {
            id: true,
            title: true,
            position: true,
          },
        },
        label: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });
  }

  async remove(userId: string, cardId: string, labelId: string) {
    // 1. Check cardLabel exists
    const cardLabel = await this.prisma.cardLabel.findUnique({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
      select: {
        card: {
          select: {
            list: { select: { boardId: true } },
          },
        },
      },
    });

    if (!cardLabel) {
      throw new NotFoundException(ERROR_MESSAGES.CARD_LABEL.NOT_FOUND);
    }

    const boardId = cardLabel.card.list.boardId;
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    // 3. Delete link
    await this.prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
