import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CardQueryDto, CreateCardDto, UpdateCardDto } from './dtos/card.dto';
import { ERROR_MESSAGES } from 'src/constants/error-messages.constant';
import { ROLETYPE } from '../../constants/role-type.constant';
import { SUCCESS_MESSAGES } from '../../constants/success-messages.constant';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async findAll(listId: string, userId: string, query: CardQueryDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: {
        board: {
          select: {
            ownerId: true,
            members: { select: { userId: true } },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    const board = list.board;

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_MEMBER);
    }

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

    const orderBy = query.order?.includes(':')
      ? (() => {
          const [field, dir] = query.order.split(':');
          return { [field]: dir?.toUpperCase() === 'DESC' ? 'desc' : 'asc' };
        })()
      : { createdAt: 'desc' };

    const select = query.fields
      ? Object.fromEntries(query.fields.split(',').map((f) => [f.trim(), true]))
      : {
          id: true,
          title: true,
          description: true,
          position: true,
          dueDate: true,
          createdBy: true,
          members: true,
          createdAt: true,
          updatedAt: true,
        };

    const [data, total] = await Promise.all([
      this.prisma.card.findMany({ where, skip, take, orderBy, select }),
      this.prisma.card.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(userId: string, listId: string, dto: CreateCardDto) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: {
        board: {
          select: {
            ownerId: true,
            members: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    const board = list.board;
    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;
    const canCreate = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canCreate) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.ACCESS_DENIED);
    }

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
        board: {
          select: {
            ownerId: true,
            members: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException(ERROR_MESSAGES.CARD.NOT_FOUND);
    }

    const board = list.board;
    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;
    const canCreate = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canCreate) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.ACCESS_DENIED);
    }

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
            id: true,
            board: {
              select: {
                ownerId: true,
                members: { select: { userId: true, role: true } },
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
    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;
    const canDelete = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canDelete) {
      throw new ForbiddenException(ERROR_MESSAGES.CARD.ACCESS_DENIED);
    }

    await this.prisma.card.delete({
      where: { id: cardId },
    });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
