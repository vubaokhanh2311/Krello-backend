import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
@Controller('user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  @Get()
  @Permissions('user.view')
  findAll() {
    return 'Danh sách người dùng';
  }
}
