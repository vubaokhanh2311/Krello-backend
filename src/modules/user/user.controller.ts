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
  Param,
  Delete,
  Post,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionEnum } from '../../constants/permissions.enum';
import { UserService } from './user.service';
import {
  UpdateProfileDto,
  UpdateUserDto,
  CreateUserDto,
  PaginationDto,
} from './dtos/user.dto';
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
  async findAll(@Query() query: PaginationDto) {
    return this.userService.findAll(query);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let avatarUrl: string | undefined;

    if (file) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
      const originalPath = join(uploadDir, file.filename);
      const tempPath = join(uploadDir, `temp-${file.filename}`);

      await sharp(originalPath).resize(256, 256).toFile(tempPath);

      fs.unlinkSync(originalPath);
      fs.renameSync(tempPath, originalPath);

      avatarUrl = `/uploads/avatars/${file.filename}`;
    }

    return this.userService.update(id, {
      ...dto,
      ...(avatarUrl && { avatarUrl }),
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('profile')
  async getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.userService.getProfile(req.user.uid);
  }

  @Put('profile')
  async updateProfile(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UpdateProfileDto,
  ) {
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

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    await this.userService.updateAvatar(userId, { avatarUrl });

    return { avatarUrl };
  }
}
