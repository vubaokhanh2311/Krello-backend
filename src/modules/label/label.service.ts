import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  LabelQueryDto,
  CreateLabelDto,
  UpdateLabelDto,
} from './dtos/label.dto';
import { ERROR_MESSAGES } from 'src/constants/error-messages.constant';
import { ROLETYPE } from '../../constants/role-type.constant';
import { SUCCESS_MESSAGES } from 'src/constants/success-messages.constant';
@Injectable()
export class LabelService {
  constructor(private prisma: PrismaService) {}

  async findAll(boardId: string, userId: string, query: LabelQueryDto) {
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

    if (!board) {
      throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
    }

    const isOwner = board.ownerId === userId;
    const isMember = board.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.NOT_MEMBER);
    }

    const where: any = { boardId };

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.color) {
      where.color = { contains: query.color, mode: 'insensitive' };
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
          name: true,
          color: true,
          boardId: true,
          createdAt: true,
          updatedAt: true,
        };

    const [data, total] = await Promise.all([
      this.prisma.label.findMany({ where, skip, take, orderBy, select }),
      this.prisma.label.count({ where }),
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

  async create(userId: string, boardId: string, dto: CreateLabelDto) {
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

    return this.prisma.label.create({
      data: {
        ...dto,
        boardId,
      },
      select: {
        id: true,
        name: true,
        color: true,
        boardId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    userId: string,
    boardId: string,
    labelId: string,
    dto: UpdateLabelDto,
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

    return this.prisma.label.update({
      where: { id: labelId },
      data: { ...dto },
      select: {
        id: true,
        name: true,
        color: true,
        boardId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  async remove(userId: string, labelId: string) {
    const list = await this.prisma.list.findUnique({
      where: { id: labelId },
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

    await this.prisma.label.delete({ where: { id: labelId } });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
