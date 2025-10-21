import {
  Controller,
  Get,
  UseGuards,
  Req,
  Body,
  Put,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionEnum } from '../../constants/permissions.enum';
import { UserService } from './user.service';
import { UpdateProfileDto, UpdateAvatarDto } from './dtos/user.dto';
@Controller('user')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @Permissions(PermissionEnum.USER_VIEW)
  findAll() {
    return 'Danh sách người dùng';
  }

  @Get('profile')
  async getProfile(@Req() req) {
    return this.userService.getProfile(req.user.uid);
  }

  @Put('profile')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.uid, dto);
  }

  @Patch('avatar')
  async updateAvatar(@Req() req, @Body() dto: UpdateAvatarDto) {
    return this.userService.updateAvatar(req.user.uid, dto.avatarUrl);
  }
}
