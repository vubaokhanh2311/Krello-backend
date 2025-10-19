import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Gắn quyền cần thiết cho 1 route handler
 * @example
 * @Permissions('user.create', 'user.delete')
 */
export const Permissions = (
  ...permissions: string[]
): ReturnType<typeof SetMetadata> => SetMetadata(PERMISSIONS_KEY, permissions);
