import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateListDto, UpdateListDto, ListQueryDto } from './dtos/list.dto';
import { ROLETYPE } from '../../constants/role-type.constant';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async findAll(boardId: string, userId: string, query: ListQueryDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: { select: { userId: true } },
      },
    });

    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_MEMBER);
    }

    const where: any = { boardId };

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
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
          position: true,
          createdAt: true,
          updatedAt: true,
        };

    const [data, total] = await Promise.all([
      this.prisma.list.findMany({ where, skip, take, orderBy, select }),
      this.prisma.list.count({ where }),
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

  async create(userId: string, boardId: string, dto: CreateListDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: { select: { userId: true, role: true } },
      },
    });

    if (!board) throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;
    const canCreate = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canCreate) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);
    }

    return this.prisma.list.create({
      data: {
        ...dto,
        boardId,
      },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    userId: string,
    boardId: string,
    listId: string,
    dto: UpdateListDto,
  ) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: { select: { userId: true, role: true } },
      },
    });

    if (!board) throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;

    const canUpdate = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canUpdate) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);
    }

    return this.prisma.list.update({
      where: { id: listId },
      data: { ...dto },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, listId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: listId },
      select: { boardId: true },
    });

    if (!list) throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    const board = await this.prisma.board.findUnique({
      where: { id: list.boardId },
      select: {
        ownerId: true,
        members: { select: { userId: true, role: true } },
      },
    });

    if (!board) throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    const isOwner = board.ownerId === userId;
    const member = board.members.find((m) => m.userId === userId);
    const memberRole = member?.role as ROLETYPE;

    const canDelete = isOwner || memberRole === ROLETYPE.EDITOR;

    if (!canDelete) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);
    }

    await this.prisma.list.delete({ where: { id: listId } });

    return { deleted: true };
  }
}
