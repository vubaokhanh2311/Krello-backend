export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Login successful',
    REGISTER: 'Registration successful',
    LOGOUT: 'Logout successful',
  },
  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
  },
  COMMON: {
    SUCCESS: 'Action completed successfully',
  },
  BOARD: {
    NOT_FOUND: 'Board not found',
    SUCCESS_MEMBER: 'Member invited successfully',
    MEMBER_REMOVED: 'Member removed successfully',
    EMAIL_SENT: 'Invitation email sent successfully',
    MEMBER_ROLE_UPDATED: 'Role updated successfully',
  },
} as const;
