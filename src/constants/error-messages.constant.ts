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
  },
  UPLOAD_FILE: {
    ERROR: 'Only image files are allowed!',
  },
  COMMON: {
    UNKNOWN_ERROR: 'An unexpected error occurred, please try again later',
  },
} as const;
