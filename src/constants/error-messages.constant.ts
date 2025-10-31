export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'Email already in use',
    EMAIL_NOT_FOUND: 'Email not found',
    INVALID_PASSWORD: 'Incorrect password',
    INVALID_TOKEN: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
    ACCESS_DENIED: 'Access denied: insufficient permissions.',
  },
  USER: {
    NOT_FOUND: 'User not found',
    NOT_FOUND_UPDATE: 'User not found or cannot update',
    NOT_FOUND_DELETE: 'User not found or cannot delete',
    EMAIL_ALREADY_EXISTS: 'Email already in use by another user',
  },
  UPLOAD_FILE: {
    ERROR: 'Only image files are allowed!',
  },
  COMMON: {
    UNKNOWN_ERROR: 'An unexpected error occurred, please try again later',
  },
  BOARD: {
    NOT_FOUND: 'Board not found',
    USER_ALREADY_A_MEMBER: 'User already a member of this board',
    OWNER_NOT_BOARD: 'You are not the owner of this board',
    NOT_MEMBER: 'Member not found in board',
  },
  INVITATION: {
    NOT_FOUND: 'Invitation not found',
    ALREADY_HANDLED: 'Invitation already handled',
    EXPIRED: 'Invitation expired',
    EMAIL_MISMATCH: 'This invitation is not for your email',
    ALREADY_PENDING: 'This email has already been invited',
  },
} as const;
