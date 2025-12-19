import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketEventsService {
  constructor(private socketGateway: SocketGateway) {}

  emitBoardCreated(boardId: string, data: any) {
    this.socketGateway.emitToAll('board:created', { boardId, ...data });
  }

  emitBoardUpdated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'board:updated', data);
  }

  emitBoardDeleted(boardId: string) {
    this.socketGateway.emitToBoard(boardId, 'board:deleted', { boardId });
  }

  emitMemberAdded(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'board:member:added', data);

    this.socketGateway.emitToUser(data.userId, 'board:invitation', {
      boardId,
      ...data,
    });
  }

  emitMemberRemoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'board:member:removed', data);
    this.socketGateway.emitToUser(data.userId, 'board:member:removed', {
      boardId,
    });
  }

  emitMemberRoleUpdated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'board:member:role:updated', data);
  }

  emitListCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'list:created', data);
  }

  emitListUpdated(boardId: string, listId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'list:updated', {
      listId,
      ...data,
    });
  }

  emitListDeleted(boardId: string, listId: string) {
    this.socketGateway.emitToBoard(boardId, 'list:deleted', { listId });
  }

  emitListMoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'list:moved', data);
  }

  emitCardCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:created', data);
  }

  emitCardUpdated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:updated', {
      cardId,
      ...data,
    });
  }

  emitCardDeleted(boardId: string, cardId: string) {
    this.socketGateway.emitToBoard(boardId, 'card:deleted', { cardId });
  }

  emitCardMoved(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:moved', data);
  }

  emitCardMemberAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:member:added', {
      cardId,
      ...data,
    });

    this.socketGateway.emitToUser(data.userId, 'card:assigned', {
      boardId,
      cardId,
      ...data,
    });
  }

  emitCardMemberRemoved(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:member:removed', {
      cardId,
      ...data,
    });
  }

  emitCommentCreated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'comment:created', {
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
    this.socketGateway.emitToBoard(boardId, 'comment:updated', {
      cardId,
      commentId,
      ...data,
    });
  }

  emitCommentDeleted(boardId: string, cardId: string, commentId: string) {
    this.socketGateway.emitToBoard(boardId, 'comment:deleted', {
      cardId,
      commentId,
    });
  }

  emitAttachmentAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'attachment:added', {
      cardId,
      ...data,
    });
  }

  emitAttachmentDeleted(boardId: string, cardId: string, attachmentId: string) {
    this.socketGateway.emitToBoard(boardId, 'attachment:deleted', {
      cardId,
      attachmentId,
    });
  }

  emitChecklistCreated(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'checklist:created', {
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
    this.socketGateway.emitToBoard(boardId, 'checklist:updated', {
      cardId,
      checklistId,
      ...data,
    });
  }

  emitChecklistDeleted(boardId: string, cardId: string, checklistId: string) {
    this.socketGateway.emitToBoard(boardId, 'checklist:deleted', {
      cardId,
      checklistId,
    });
  }

  emitLabelCreated(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'label:created', data);
  }

  emitLabelUpdated(boardId: string, labelId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'label:updated', {
      labelId,
      ...data,
    });
  }

  emitLabelDeleted(boardId: string, labelId: string) {
    this.socketGateway.emitToBoard(boardId, 'label:deleted', { labelId });
  }

  emitCardLabelAdded(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'card:label:added', {
      cardId,
      ...data,
    });
  }

  emitCardLabelRemoved(boardId: string, cardId: string, labelId: string) {
    this.socketGateway.emitToBoard(boardId, 'card:label:removed', {
      cardId,
      labelId,
    });
  }

  emitNotification(userId: string, data: any) {
    this.socketGateway.emitToUser(userId, 'notification:new', data);
  }

  emitUserTyping(boardId: string, cardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'user:typing', {
      cardId,
      ...data,
    });
  }

  emitUserStoppedTyping(boardId: string, cardId: string, userId: string) {
    this.socketGateway.emitToBoard(boardId, 'user:stopped-typing', {
      cardId,
      userId,
    });
  }

  emitActivity(boardId: string, data: any) {
    this.socketGateway.emitToBoard(boardId, 'activity:created', data);
  }
}
