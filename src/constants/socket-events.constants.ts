export const SOCKET_EVENTS = {
  BOARD_CREATED: 'board:created',
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',
  BOARD_INVITATION: 'board:invitation',

  BOARD_MEMBER_ADDED: 'board:member:added',
  BOARD_MEMBER_REMOVED: 'board:member:removed',
  BOARD_MEMBER_ROLE_UPDATED: 'board:member:role:updated',

  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  LIST_MOVED: 'list:moved',

  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_MOVED: 'card:moved',
  CARD_ASSIGNED: 'card:assigned',

  CARD_MEMBER_ADDED: 'card:member:added',
  CARD_MEMBER_REMOVED: 'card:member:removed',

  CARD_LABEL_ADDED: 'card:label:added',
  CARD_LABEL_REMOVED: 'card:label:removed',

  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',

  ATTACHMENT_ADDED: 'attachment:added',
  ATTACHMENT_DELETED: 'attachment:deleted',

  CHECKLIST_CREATED: 'checklist:created',
  CHECKLIST_UPDATED: 'checklist:updated',
  CHECKLIST_DELETED: 'checklist:deleted',

  LABEL_CREATED: 'label:created',
  LABEL_UPDATED: 'label:updated',
  LABEL_DELETED: 'label:deleted',

  USER_TYPING: 'user:typing',
  USER_STOPPED_TYPING: 'user:stopped-typing',

  NOTIFICATION_NEW: 'notification:new',

  ACTIVITY_CREATED: 'activity:created',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
