import { PrismaService } from '../../shared/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
import { ROLETYPE } from '../../constants/role-type.constant';

export async function checkBoardAccess(
  prisma: PrismaService,
  boardId: string,
  userId: string,
  allowedRoles: ROLETYPE[] = [ROLETYPE.VIEWER, ROLETYPE.EDITOR],
  ownerOnly = false,
) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: { select: { userId: true, role: true } },
    },
  });

  if (!board) {
    throw new NotFoundException(ERROR_MESSAGES.BOARD.NOT_FOUND);
  }

  const isOwner = board.ownerId === userId;
  const member = board.members.find((m) => m.userId === userId);
  const memberRole = member?.role as ROLETYPE;

  if (ownerOnly && !isOwner) {
    throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);
  }

  const canAccess = isOwner || allowedRoles.includes(memberRole);

  if (!canAccess) {
    throw new ForbiddenException(ERROR_MESSAGES.BOARD.OWNER_NOT_BOARD);
  }

  return board;
}
