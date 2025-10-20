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

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user?.role) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);
    }

    const rolePermissions = await this.authService.getPermissionsByRole(
      user.role,
    );

    const hasAllPermissions = requiredPermissions.every((perm) =>
      rolePermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.ACCESS_DENIED);
    }

    return true;
  }
}
