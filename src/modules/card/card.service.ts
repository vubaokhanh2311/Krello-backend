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
@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async findAll(listId: string, userId: string, query: CardQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: {
        board: { select: { id: true } },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId);

    const where: any = { listId };

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }
    if (query.dueDate) {
      where.dueDate = {
        equals: new Date(query.dueDate),
      };
    }

    if (query.position) {
      where.position = { equals: Number(query.position) };
    }

    const orderBy = parseOrder(query.order);
    const select = parseSelectFields(query.fields, {
      id: true,
      title: true,
      description: true,
      position: true,
      dueDate: true,
      createdBy: true,
      members: true,
      createdAt: true,
      updatedAt: true,
    });

    const [data, total] = await Promise.all([
      this.prisma.card.findMany({ where, skip, take, orderBy, select }),
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
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId, [
      ROLETYPE.EDITOR,
    ]);

    return this.prisma.card.create({
      data: {
        ...dto,
        listId,
        createdBy: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        dueDate: true,
        createdBy: true,
        members: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    userId: string,
    listId: string,
    cardId: string,
    dto: UpdateCardDto,
  ) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: {
        board: { select: { id: true } },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.LIST.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, list.board.id, userId, [
      ROLETYPE.EDITOR,
    ]);

    return this.prisma.card.update({
      where: { id: cardId },
      data: { ...dto },
      select: {
        id: true,
        title: true,
        description: true,
        position: true,
        dueDate: true,
        createdBy: true,
        members: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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

    await this.prisma.card.delete({
      where: { id: cardId },
    });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
