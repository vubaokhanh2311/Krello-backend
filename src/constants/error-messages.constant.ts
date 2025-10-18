export const ERROR_MESSAGES = {
  AUTH: {
    EMAIL_EXISTS: 'Email already in use',
    EMAIL_NOT_FOUND: 'Email not found',
    INVALID_PASSWORD: 'Incorrect password',
    INVALID_TOKEN: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
  },
  USER: {
    NOT_FOUND: 'User not found',
  },
  COMMON: {
    UNKNOWN_ERROR: 'An unexpected error occurred, please try again later',
  },
} as const;
