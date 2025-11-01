import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateListDto, UpdateListDto } from './dtos/list.dto';
import { ROLETYPE } from '../../constants/role-type.constant';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}
  async findAll(boardId: string) {
    const list = await this.prisma.list.findMany({
      where: { id: boardId },
      select: {
        id: true,
        title: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return list;
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
