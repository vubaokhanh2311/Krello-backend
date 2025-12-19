import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CardQueryDto, CreateCardDto, UpdateCardDto } from './dtos/card.dto';
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
export class CardService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
  ) {}

  async findAll(listId: string, userId: string, query: CardQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: { board: { select: { id: true } } },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId);

    const where: any = { listId };
    if (query.title)
      where.title = { contains: query.title, mode: 'insensitive' };
    if (query.dueDate) where.dueDate = { equals: new Date(query.dueDate) };
    if (query.position) where.position = { equals: Number(query.position) };

    const orderBy = query.order ? parseOrder(query.order) : { position: 'asc' };

    const selectFields = parseSelectFields(query.fields, {
      id: true,
      title: true,
      description: true,
      position: true,
      dueDate: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    });

    const [data, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          ...selectFields,
          members: {
            select: {
              id: true,
              joinedAt: true,
              userId: true,
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,

              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
          labels: {
            select: {
              label: { select: { id: true, name: true, color: true } },
            },
          },
        },
      }),
      this.prisma.card.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(userId: string, listId: string, dto: CreateCardDto) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: {
        board: { select: { id: true } },
        cards: {
          orderBy: { position: 'asc' },
          select: { id: true, position: true },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId, [
      ROLETYPE.EDITOR,
    ]);

    const cards = list.cards;
    const index = dto.position ?? cards.length;

    let newPos: number;
    if (cards.length === 0) {
      newPos = 1024;
    } else if (index <= 0) {
      newPos = cards[0].position / 2;
    } else if (index >= cards.length) {
      newPos = cards[cards.length - 1].position + 1024;
    } else {
      const prev = cards[index - 1].position;
      const next = cards[index].position;
      newPos = (prev + next) / 2;
    }

    const newCard = await this.prisma.card.create({
      data: {
        ...dto,
        listId,
        createdBy: userId,
        position: newPos,
      },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        dueDate: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        members: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.socketEvents.emitCardCreated(list.board.id, {
      card: newCard,
      listId,
    });

    void this.activityService.logCardCreated(list.board.id, newCard.id, userId);
    return newCard;
  }

  async update(
    userId: string,
    listId: string,
    cardId: string,
    dto: UpdateCardDto,
  ) {
    const targetListId = dto.listId || listId;

    const list = await this.prisma.list.findUnique({
      where: { id: targetListId },
      select: { board: { select: { id: true } } },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId, [
      ROLETYPE.EDITOR,
    ]);

    const updateCardData: any = {};

    if (dto.title !== undefined) updateCardData.title = dto.title;
    if (dto.description !== undefined)
      updateCardData.description = dto.description;
    if (dto.dueDate !== undefined) updateCardData.dueDate = dto.dueDate;

    if (dto.listId) {
      updateCardData.list = { connect: { id: dto.listId } };
    }

    const transactionOps: any[] = [];

    if (dto.taskOrder && Array.isArray(dto.taskOrder)) {
      const reorderOps = dto.taskOrder.map((id, index) =>
        this.prisma.card.update({
          where: { id },
          data: { position: index * 1024 },
        }),
      );

      transactionOps.push(...reorderOps);
    }

    const updateSelectedCard = this.prisma.card.update({
      where: { id: cardId },
      data: updateCardData,
    });

    transactionOps.push(updateSelectedCard);

    await this.prisma.$transaction(transactionOps);

    const updated = await this.prisma.card.findUnique({
      where: { id: cardId },
    });
    this.socketEvents.emitCardUpdated(list.board.id, cardId, updated);
    void this.activityService.logCardUpdated(list.board.id, cardId, userId);
    return updated;
  }

  async remove(userId: string, cardId: string) {
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

    await this.prisma.cardLabel.deleteMany({
      where: { cardId },
    });

    await this.prisma.cardMember.deleteMany({
      where: { cardId },
    });

    await this.prisma.comment.deleteMany({
      where: { cardId },
    });

    await this.prisma.attachment.deleteMany({
      where: { cardId },
    });

    await this.prisma.card.delete({
      where: { id: cardId },
    });

    this.socketEvents.emitCardDeleted(boardId, cardId);
    void this.activityService.logCardDeleted(boardId, cardId, userId);

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
