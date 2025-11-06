import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

import {
  SUCCESS_MESSAGES,
  ROLETYPE,
  ERROR_MESSAGES,
} from 'src/constants/index';

import {
  getPagination,
  parseOrder,
  parseSelectFields,
  checkBoardAccess,
  buildMeta,
} from '../../common/utils/index';
import {
  AttachmentQueryDto,
  CreateAttachmentDto,
  UpdateAttachmentDto,
} from './dtos/attachment.dto';
@Injectable()
export class AttachmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(cardId: string, userId: string, query: AttachmentQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

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

    await checkBoardAccess(this.prisma, card.list.boardId, userId);

    const where: any = { cardId };

    if (query.fileName) {
      where.fileName = { contains: query.fileName, mode: 'insensitive' };
    }
    if (query.uploadedBy) {
      where.uploadedBy = { contains: query.uploadedBy, mode: 'insensitive' };
    }

    const orderBy = parseOrder(query.order);

    const baseSelect = parseSelectFields(query.fields, {
      id: true,
      fileName: true,
      fileUrl: true,
      uploadedBy: true,
      cardId: true,
      createdAt: true,
      updatedAt: true,
    });

    const select = {
      ...baseSelect,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      card: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.attachment.findMany({ where, skip, take, orderBy, select }),
      this.prisma.attachment.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }

  async create(userId: string, cardId: string, dto: CreateAttachmentDto) {
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

    return this.prisma.attachment.create({
      data: {
        ...dto,
        cardId,
        uploadedBy: userId,
      },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        uploadedBy: true,
        cardId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        card: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
  }

  async update(
    userId: string,
    attachmentId: string,
    cardId: string,
    dto: UpdateAttachmentDto,
  ) {
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

    await checkBoardAccess(this.prisma, card.list.boardId, userId, [
      ROLETYPE.EDITOR,
    ]);

    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(ERROR_MESSAGES.ATTACHMENT.NOT_FOUND);
    }

    if (attachment.user.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.USER.NOT_FOUND_UPDATE);
    }

    return this.prisma.attachment.update({
      where: { id: attachmentId },
      data: { ...dto },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        uploadedBy: true,
        cardId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        card: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
  }

  async remove(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      select: {
        card: {
          select: {
            list: {
              select: {
                boardId: true,
              },
            },
          },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(ERROR_MESSAGES.ATTACHMENT.NOT_FOUND);
    }

    const boardId = attachment.card.list.boardId;

    await checkBoardAccess(this.prisma, boardId, userId, [ROLETYPE.EDITOR]);

    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: SUCCESS_MESSAGES.COMMON.SUCCESS };
  }
}
