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
  UserQueryDto,
  UpdateAvatarDto,
} from './dtos/user.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../config/multer.config';
import sharp from 'sharp';
import { join } from 'path';
import * as fs from 'fs';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('users')
@ApiSecurityAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @ApiOperation({
    summary: 'Get list of users',
    description:
      'Retrieve a paginated list of users with optional filtering by name and email. Requires USER_VIEW permission.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved users' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @Permissions(PermissionEnum.USER_VIEW)
  async findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      "Retrieve the authenticated user's profile information including name, email, avatar, and role.",
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async getProfile(@Req() req: Request & { user: JwtPayload }) {
    return this.userService.getProfile(req.user.uid);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update profile',
    description:
      "Update the authenticated user's profile information (name and email).",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async updateProfile(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.uid, dto);
  }

  @Patch('avatar')
  @ApiOperation({
    summary: 'Update avatar',
    description:
      "Upload and update the authenticated user's avatar image. Image will be automatically resized to 256x256 pixels.",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({ status: 200, description: 'Avatar successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid file format' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Retrieve a specific user by their ID.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved user' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({
    summary: 'Create new user',
    description:
      'Create a new user account. Optionally include avatar image and role assignment.',
  })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update user',
    description:
      'Update user information including name, email, role, and avatar. Avatar image will be automatically resized to 256x256 pixels.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user account.',
  })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
