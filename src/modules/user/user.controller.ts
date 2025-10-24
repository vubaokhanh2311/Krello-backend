import {
  Controller,
  Get,
  UseGuards,
  Req,
  Body,
  Put,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionEnum } from '../../constants/permissions.enum';
import { UserService } from './user.service';
import { UpdateProfileDto, UpdateAvatarDto } from './dtos/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import sharp from 'sharp';
import { join } from 'path';
import * as fs from 'fs';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
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
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    const uploadPath = join(uploadDir, file.filename);

    const tempPath = join(uploadDir, `temp-${file.filename}`);

    await sharp(uploadPath).resize(256, 256).toFile(tempPath);

    fs.unlinkSync(uploadPath);
    fs.renameSync(tempPath, uploadPath);

    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${file.filename}`;

    await this.userService.updateAvatar(userId, { avatarUrl });

    return { avatarUrl };
  }
}
