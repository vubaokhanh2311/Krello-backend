import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateListDto, UpdateListDto, ListQueryDto } from './dtos/list.dto';
import { ROLETYPE } from '../../constants/role-type.constant';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/index';
import {
  getPagination,
  parseOrder,
  parseSelectFields,
  checkBoardAccess,
  buildMeta,
} from '../../common/utils/index';
@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async findAll(boardId: string, userId: string, query: ListQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    await checkBoardAccess(this.prisma, boardId, userId);

    const where: any = { boardId };

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }
    if (query.position) {
      where.position = { equals: Number(query.position) };
    }

    const orderBy = parseOrder(query.order);

    const select = parseSelectFields(query.fields, {
      id: true,
      title: true,
      position: true,
      createdAt: true,
      updatedAt: true,
    });
    const [data, total] = await Promise.all([
      this.prisma.list.findMany({ where, skip, take, orderBy, select }),
      this.prisma.list.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(userId: string, boardId: string, dto: CreateListDto) {
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    const listCount = await this.prisma.list.count({
      where: { boardId },
    });

    const newPosition = listCount;

    return this.prisma.list.create({
      data: {
        title: dto.title,
        boardId,
        position: newPosition,
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
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    return this.prisma.list.update({
      where: { id: listId },
      data: { title: dto.title },
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

    await checkBoardAccess(this.prisma, list.boardId, userId, [
      ROLETYPE.EDITOR,
    ]);

    await this.prisma.list.delete({ where: { id: listId } });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
