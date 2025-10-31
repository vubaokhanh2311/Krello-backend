import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { SUCCESS_MESSAGES } from '../../constants/success-messages.constant';

import {
  CreateBoardDto,
  UpdateBoardDto,
  BoardQueryDto,
  InviteMemberDto,
} from './dtos/board.dto';
@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: BoardQueryDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = { ownerId: userId };
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.background) {
      where.background = { contains: query.background, mode: 'insensitive' };
    }

    let orderBy: any = undefined;
    if (query.order) {
      const [field, direction] = query.order.split(':');
      orderBy = {
        [field]: direction?.toUpperCase() === 'DESC' ? 'desc' : 'asc',
      };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    let select: any = undefined;
    if (query.fields) {
      select = {};
      query.fields.split(',').forEach((f) => (select[f.trim()] = true));
    } else {
      select = {
        id: true,
        name: true,
        description: true,
        background: true,
        createdAt: true,
        updatedAt: true,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        skip,
        take,
        orderBy,
        select,
      }),
      this.prisma.board.count({ where }),
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

  async findOne(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        name: true,
        description: true,
        background: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
    if (board.ownerId !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    return board;
  }

  async create(userId: string, dto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        ...dto,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        background: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(userId: string, boardId: string, dto: UpdateBoardDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    if (board.ownerId !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    return this.prisma.board.update({
      where: { id: boardId },
      data: dto,
      select: {
        id: true,
        name: true,
        description: true,
        background: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    if (board.ownerId !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    await this.prisma.board.delete({ where: { id: boardId } });
    return { deleted: true };
  }

  async inviteMember(boardId: string, ownerId: string, dto: InviteMemberDto) {
    const { userId, role } = dto;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
    if (board.ownerId !== ownerId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    const exists = await this.prisma.boardMember.findFirst({
      where: { boardId, userId },
    });
    if (exists)
      throw new BadRequestException(ERROR_MESSAGES.BOARD.USER_ALREADY_A_MEMBER);

    const member = await this.prisma.boardMember.create({
      data: { boardId, userId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return { message: SUCCESS_MESSAGES.BOARD.SUCCESS_MEMBER, member };
  }

  async removeMember(boardId: string, userId: string, ownerId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
    if (board.ownerId !== ownerId)
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);

    const member = await this.prisma.boardMember.findFirst({
      where: { boardId, userId },
    });
    if (!member) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_MEMBER);

    await this.prisma.boardMember.delete({
      where: { id: member.id },
    });

    return { message: SUCCESS_MESSAGES.BOARD.MEMBER_REMOVED };
  }

  async getMembers(boardId: string) {
    const members = await this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return members;
  }
}
