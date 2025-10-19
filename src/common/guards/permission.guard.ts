import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import { ERROR_MESSAGES } from '../../constants/error-messages.constant';
/**
 * Kiểm tra xem user có đủ quyền để truy cập route hay không
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.permissions) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      user.permissions?.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);
    }

    return true;
  }
}
