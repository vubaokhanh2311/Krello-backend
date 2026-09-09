import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  LabelQueryDto,
  CreateLabelDto,
  UpdateLabelDto,
} from './dtos/label.dto';

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
export class LabelService {
  constructor(
    private prisma: PrismaService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
  ) {}

  async findAll(boardId: string, userId: string, query: LabelQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    await checkBoardAccess(this.prisma, boardId, userId);

    const where: Prisma.LabelWhereInput = { boardId };

    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.color) {
      where.color = { contains: query.color, mode: 'insensitive' };
    }

    const orderBy = parseOrder(query.order);

    const select = parseSelectFields(query.fields, {
      id: true,
      name: true,
      color: true,
      boardId: true,
      createdAt: true,
      updatedAt: true,
    });

    const [data, total] = await Promise.all([
      this.prisma.label.findMany({ where, skip, take, orderBy, select }),
      this.prisma.label.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(userId: string, boardId: string, dto: CreateLabelDto) {
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    const label = await this.prisma.label.create({
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

    void this.socketEvents.emitLabelCreated(boardId, label);
    void this.activityService.logLabelCreated(boardId, label.id, userId);
    return label;
  }

  async update(
    userId: string,
    boardId: string,
    labelId: string,
    dto: UpdateLabelDto,
  ) {
    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    const updated = await this.prisma.label.update({
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

    void this.socketEvents.emitLabelUpdated(boardId, labelId, updated);
    void this.activityService.logLabelUpdated(boardId, labelId, userId);
    return updated;
  }
  async remove(userId: string, labelId: string) {
    const label = await this.prisma.label.findUnique({
      where: { id: labelId },
      select: { boardId: true },
    });

    if (!label) {
      throw new NotFoundException(ERROR_MESSAGES.LABEL.NOT_FOUND);
    }

    await checkBoardAccess(this.prisma, label.boardId, userId, [
      ROLETYPE.EDITOR,
    ]);

    await this.prisma.cardLabel.deleteMany({
      where: { labelId },
    });

    await this.prisma.label.delete({
      where: { id: labelId },
    });

    void this.socketEvents.emitLabelDeleted(label.boardId, labelId);
    void this.activityService.logLabelDeleted(label.boardId, labelId, userId);

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
