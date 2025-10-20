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
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu route không yêu cầu quyền -> cho qua
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.uid) {
      throw new ForbiddenException('Access denied: no user info in token.');
    }

    // 🔥 Lấy quyền của user (đã có cache)
    const userPermissions = await this.authService.getPermissionsByUser(
      String(user.uid),
    );

    // 🔎 Kiểm tra user có đủ quyền không
    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Access denied: insufficient permissions.');
    }

    return true;
  }
}
