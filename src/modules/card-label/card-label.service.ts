import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCardLabelDto } from './dtos/card-label.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROLETYPE,
} from '../../constants/index';

import { checkBoardAccess } from '../../common/utils/index';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CardLabelService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
  ) {}

  async create(userId: string, cardId: string, dto: CreateCardLabelDto) {
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

    const label = await this.prisma.label.findUnique({
      where: { id: dto.labelId },
      select: { id: true },
    });

    if (!label) {
      throw new NotFoundException(ERROR_MESSAGES.LABEL.NOT_FOUND);
    }

    const boardId = card.list.boardId;
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    const cardLabel = await this.prisma.cardLabel.upsert({
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
      update: {},
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

    this.socketEvents.emitCardLabelAdded(boardId, cardId, cardLabel);
    void this.activityService.logCardLabelAdded(
      boardId,
      cardId,
      dto.labelId,
      userId,
    );
    return cardLabel;
  }

  async remove(userId: string, cardId: string, labelId: string) {
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

    await this.prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId,
          labelId,
        },
      },
    });

    this.socketEvents.emitCardLabelRemoved(boardId, cardId, labelId);
    void this.activityService.logCardLabelRemoved(
      boardId,
      cardId,
      labelId,
      userId,
    );

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
