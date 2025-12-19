import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SOCKET_EVENTS } from '../../constants/socket-events.constants';

@Injectable()
export class SocketEventsService {
  constructor(private socketGateway: SocketGateway) {}

  emitBoardCreated(boardId: string, data: any) {
    this.socketGateway.emitToAll(SOCKET_EVENTS.BOARD_CREATED, {
      boardId,
      ...data,
    });
  }

  emitBoardUpdated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.BOARD_UPDATED, data);
  }

  emitBoardDeleted(boardId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.BOARD_DELETED, {
      boardId,
    });
  }

  emitMemberAdded(boardId: string, data: any) {
    this.socketGateway.emitToBoard(
      boardId,
      SOCKET_EVENTS.BOARD_MEMBER_ADDED,
      data,
    );
    this.socketGateway.emitToUser(data.userId, SOCKET_EVENTS.BOARD_INVITATION, {
      boardId,
      ...data,
    });
  }

  emitMemberRemoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(
      boardId,
      SOCKET_EVENTS.BOARD_MEMBER_REMOVED,
      data,
    );
    this.socketGateway.emitToUser(
      data.userId,
      SOCKET_EVENTS.BOARD_MEMBER_REMOVED,
      {
        boardId,
      },
    );
  }

  emitMemberRoleUpdated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(
      boardId,
      SOCKET_EVENTS.BOARD_MEMBER_ROLE_UPDATED,
      data,
    );
  }

  emitListCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LIST_CREATED, data);
  }

  emitListUpdated(boardId: string, listId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LIST_UPDATED, {
      listId,
      ...data,
    });
  }

  emitListDeleted(boardId: string, listId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LIST_DELETED, {
      listId,
    });
  }

  emitListMoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LIST_MOVED, data);
  }

  emitCardCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_CREATED, data);
  }

  emitCardUpdated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_UPDATED, {
      cardId,
      ...data,
    });
  }

  emitCardDeleted(boardId: string, cardId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_DELETED, {
      cardId,
    });
  }

  emitCardMoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_MOVED, data);
  }

  emitCardMemberAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_MEMBER_ADDED, {
      cardId,
      ...data,
    });
    this.socketGateway.emitToUser(data.userId, SOCKET_EVENTS.CARD_ASSIGNED, {
      boardId,
      cardId,
      ...data,
    });
  }

  emitCardMemberRemoved(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_MEMBER_REMOVED, {
      cardId,
      ...data,
    });
  }

  emitCommentCreated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.COMMENT_CREATED, {
      cardId,
      ...data,
    });
  }

  emitCommentUpdated(
    boardId: string,
    cardId: string,
    commentId: string,
    data: any,
  ) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.COMMENT_UPDATED, {
      cardId,
      commentId,
      ...data,
    });
  }

  emitCommentDeleted(boardId: string, cardId: string, commentId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.COMMENT_DELETED, {
      cardId,
      commentId,
    });
  }

  emitAttachmentAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.ATTACHMENT_ADDED, {
      cardId,
      ...data,
    });
  }

  emitAttachmentDeleted(boardId: string, cardId: string, attachmentId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.ATTACHMENT_DELETED, {
      cardId,
      attachmentId,
    });
  }

  emitChecklistCreated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_CREATED, {
      cardId,
      ...data,
    });
  }

  emitChecklistUpdated(
    boardId: string,
    cardId: string,
    checklistId: string,
    data: any,
  ) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_UPDATED, {
      cardId,
      checklistId,
      ...data,
    });
  }

  emitChecklistDeleted(boardId: string, cardId: string, checklistId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CHECKLIST_DELETED, {
      cardId,
      checklistId,
    });
  }

  emitLabelCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LABEL_CREATED, data);
  }

  emitLabelUpdated(boardId: string, labelId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LABEL_UPDATED, {
      labelId,
      ...data,
    });
  }

  emitLabelDeleted(boardId: string, labelId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.LABEL_DELETED, {
      labelId,
    });
  }

  emitCardLabelAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_LABEL_ADDED, {
      cardId,
      ...data,
    });
  }

  emitCardLabelRemoved(boardId: string, cardId: string, labelId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.CARD_LABEL_REMOVED, {
      cardId,
      labelId,
    });
  }

  emitNotification(userId: string, data: any) {
    this.socketGateway.emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, data);
  }

  emitUserTyping(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.USER_TYPING, {
      cardId,
      ...data,
    });
  }

  emitUserStoppedTyping(boardId: string, cardId: string, userId: string) {
    this.socketGateway.emitToBoard(boardId, SOCKET_EVENTS.USER_STOPPED_TYPING, {
      cardId,
      userId,
    });
  }

  emitActivity(boardId: string, data: any) {
    this.socketGateway.emitToBoard(
      boardId,
      SOCKET_EVENTS.ACTIVITY_CREATED,
      data,
    );
  }
}
