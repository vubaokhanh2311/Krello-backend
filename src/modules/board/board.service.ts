import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { CreateBoardDto, UpdateBoardDto } from './dtos/board.dto';
@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.board.findMany({
      where: { ownerId: userId },
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
}
