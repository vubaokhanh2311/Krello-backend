import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionEnum } from '../../constants/permissions.enum';
@Controller('user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  @Get()
  @Permissions(PermissionEnum.USER_VIEW)
  findAll() {
    return 'Danh sách người dùng';
  }
}
