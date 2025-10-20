export function genUserPermissionKey(userId: string): string {
  return `permissions:user:${userId}`;
}
