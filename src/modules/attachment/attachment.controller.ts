import {
  Controller,
  UseGuards,
  Req,
  Param,
  Query,
  Get,
  Post,
  Body,
  Delete,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AttachmentQueryDto,
  CreateAttachmentDto,
  UpdateAttachmentDto,
} from './dtos//attachment.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAttachmentConfig } from '../../config/multer-attachment.config';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Attachment')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('/cards/:cardId')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get('attachments')
  @ApiOperation({
    summary: 'Get list of attachments',
    description:
      'Retrieve all attachments on a specific card, with optional filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved attachments',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Query() query: AttachmentQueryDto,
  ) {
    const userId = req.user.uid;
    return this.attachmentService.findAll(cardId, userId, query);
  }

  @Post('attachments')
  @ApiOperation({
    summary: 'Create new attachment',
    description:
      'Upload a file attachment to a card. Supports various file types. The file will be stored and a URL will be generated.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file with attachment details',
    type: CreateAttachmentDto,
  })
  @ApiResponse({ status: 201, description: 'Attachment successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file or input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @UseInterceptors(FileInterceptor('file', multerAttachmentConfig))
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAttachmentDto,
  ) {
    const userId = req.user.uid;

    if (file) {
      dto.fileName = file.originalname;
      dto.fileUrl = `/uploads/attachments/${file.filename}`;
    }

    return this.attachmentService.create(userId, cardId, dto);
  }

  @Patch('attachments/:attachmentId')
  @ApiOperation({ summary: 'Update attachments' })
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('attachmentId') attachmentId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateAttachmentDto,
  ) {
    const userId = req.user.uid;
    return this.attachmentService.update(userId, attachmentId, cardId, dto);
  }

  @Delete('attachments/:attachmentId')
  @ApiOperation({
    summary: 'Delete attachment',
    description:
      'Permanently delete an attachment and its file. Only the uploader can delete their attachments.',
  })
  @ApiResponse({ status: 200, description: 'Attachment successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only uploader can delete',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('attachmentId') attachmentId: string,
  ) {
    const userId = req.user.uid;
    return this.attachmentService.remove(userId, attachmentId);
  }
}
