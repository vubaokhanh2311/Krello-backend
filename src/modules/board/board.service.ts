import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { EmailService } from '../../shared/mail/email.services';
import { inviteEmailTemplate } from '../../assets/templates/invite-email.template';
import {
  INVITATION_EXPIRES_MS,
  INVITESTATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '../../constants/index';
import { generateRandomToken } from '../../helpers/token.helper';
import {
  CreateBoardDto,
  UpdateBoardDto,
  BoardQueryDto,
  InviteMemberDto,
} from './dtos/board.dto';
import {
  getPagination,
  parseOrder,
  parseSelectFields,
  buildMeta,
  checkBoardAccess,
} from '../../common/utils/index';
import { RoleType } from '@prisma/client';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BoardService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private socketEvents: SocketEventsService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
  ) {}

  async findAll(userId: string, query: BoardQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const where: any = { ownerId: userId };
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }
    if (query.background) {
      where.background = { contains: query.background, mode: 'insensitive' };
    }

    const orderBy = parseOrder(query.order);

    const select = parseSelectFields(query.fields, {
      id: true,
      name: true,
      description: true,
      background: true,
      createdAt: true,
      updatedAt: true,
    });

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
      meta: buildMeta(total, page, pageSize),
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

    await checkBoardAccess(this.prisma, board.id, userId);

    return board;
  }

  async create(userId: string, dto: CreateBoardDto) {
    const board = await this.prisma.board.create({
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

    this.socketEvents.emitBoardCreated(board.id, board);
    void this.activityService.logBoardCreated(board.id, userId);
    return board;
  }

  async update(userId: string, boardId: string, dto: UpdateBoardDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    if (board.ownerId !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    const updated = await this.prisma.board.update({
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

    this.socketEvents.emitBoardUpdated(boardId, updated);
    void this.activityService.logBoardUpdated(boardId, userId);
    return updated;
  }

  async remove(userId: string, boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    if (board.ownerId !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    await this.prisma.board.delete({ where: { id: boardId } });
    this.socketEvents.emitBoardDeleted(boardId);
    void this.activityService.logBoardDeleted(boardId, userId);
    return { deleted: true };
  }

  async inviteMember(boardId: string, ownerId: string, dto: InviteMemberDto) {
    const { email, role } = dto;

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
    if (board.ownerId !== ownerId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);

    let invitation = await this.prisma.boardInvitation.findFirst({
      where: { boardId, email, status: INVITESTATUS.PENDING },
    });

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRES_MS);

    if (invitation) {
      invitation = await this.prisma.boardInvitation.update({
        where: { id: invitation.id },
        data: { token, expiresAt, invitedById: ownerId, role },
      });
    } else {
      invitation = await this.prisma.boardInvitation.create({
        data: { boardId, email, token, expiresAt, invitedById: ownerId, role },
      });
    }

    const acceptLink = `${process.env.FRONTEND_URL}/boards/invite/accept?token=${token}`;
    await this.email.sendMail(
      email,
      `Invitation to join board "${board.name}"`,
      `You have been invited to join the board "${board.name}".`,
      inviteEmailTemplate(board.name, acceptLink),
    );

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      this.socketEvents.emitMemberAdded(boardId, {
        userId: user.id,
        email,
        role,
        invitationId: invitation.id,
      });
      await this.notificationService.notifyUser(user.id, {
        title: 'Board invitation',
        body: `You were invited to board "${board.name}"`,
        data: {
          type: 'BOARD_INVITE',
          boardId,
        },
      });
      this.activityService.logBoardMemberAdded(boardId, user.id, ownerId);
    }

    return { message: SUCCESS_MESSAGES.BOARD.EMAIL_SENT };
  }

  async confirmInvite(token: string, userId: string) {
    const invite = await this.prisma.boardInvitation.findUnique({
      where: { token },
    });

    if (!invite)
      throw new NotFoundException(ERROR_MESSAGES.INVITATION.NOT_FOUND);
    if (invite.status !== INVITESTATUS.PENDING)
      throw new BadRequestException(ERROR_MESSAGES.INVITATION.ALREADY_HANDLED);
    if (invite.expiresAt < new Date())
      throw new BadRequestException(ERROR_MESSAGES.INVITATION.EXPIRED);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invite.email)
      throw new ForbiddenException(ERROR_MESSAGES.INVITATION.EMAIL_MISMATCH);

    const existingMember = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: invite.boardId,
          userId: user.id,
        },
      },
    });

    if (!existingMember) {
      const newMember = await this.prisma.boardMember.create({
        data: {
          boardId: invite.boardId,
          userId,
          role: invite.role,
        },
      });

      this.socketEvents.emitMemberAdded(invite.boardId, {
        userId,
        email: invite.email,
        role: invite.role,
        memberId: newMember.id,
      });
      void this.activityService.logBoardMemberAdded(
        invite.boardId,
        userId,
        userId,
      );
    }
    await this.notificationService.notifyUser(invite.invitedById, {
      title: 'New board member',
      body: `${user.email} joined your board`,
      data: {
        type: 'BOARD_MEMBER_JOINED',
        boardId: invite.boardId,
      },
    });

    await this.prisma.boardInvitation.update({
      where: { id: invite.id },
      data: { status: INVITESTATUS.ACCEPTED },
    });

    return {
      message: SUCCESS_MESSAGES.COMMON.SUCCESS,
      boardId: invite.boardId,
    };
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

    this.socketEvents.emitMemberRemoved(boardId, {
      userId,
      memberId: member.id,
    });
    void this.activityService.logBoardMemberRemoved(boardId, userId, ownerId);
    await this.notificationService.notifyUser(userId, {
      title: 'Removed from board',
      body: 'You have been removed from a board',
      data: {
        type: 'BOARD_MEMBER_REMOVED',
        boardId,
      },
    });

    return { message: SUCCESS_MESSAGES.BOARD.MEMBER_REMOVED };
  }

  async getMembers(boardId: string) {
    const members = await this.prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return members;
  }

  async updateMemberRole(
    boardId: string,
    userId: string,
    role: RoleType,
    ownerId: string,
  ) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });
    if (!board) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);

    if (board.ownerId !== ownerId) {
      throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);
    }

    const member = await this.prisma.boardMember.findFirst({
      where: { boardId, userId },
    });
    if (!member) throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_MEMBER);

    const updated = await this.prisma.boardMember.update({
      where: { id: member.id },
      data: { role },
    });

    this.socketEvents.emitMemberRoleUpdated(boardId, {
      userId,
      role,
      memberId: member.id,
    });
    void this.activityService.logBoardUpdated(boardId, ownerId);

    return { message: SUCCESS_MESSAGES.BOARD.MEMBER_ROLE_UPDATED };
  }

  async getBoardsJoinedByUser(userId: string, query: BoardQueryDto) {
    const { page, pageSize, skip, take } = getPagination(query);

    const where = {
      ownerId: { not: userId },
      members: {
        some: { userId },
      },
    };

    const [data, total] = await Promise.all([
      this.prisma.board.findMany({
        where,
        skip,
        take,
        include: {
          owner: true,
          members: true,
        },
      }),
      this.prisma.board.count({ where }),
    ]);

    return {
      data,
      meta: buildMeta(total, page, pageSize),
    };
  }
}
