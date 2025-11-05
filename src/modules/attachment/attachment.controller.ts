import {
  Controller,
  UseGuards,
  Req,
  Param,
  Query,
  Get,
  Post,
  Body,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
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
@UseGuards(JwtAuthGuard)
@Controller('/cards/:cardId')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Get('attachments')
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Query() query: AttachmentQueryDto,
  ) {
    const userId = req.user.uid;
    return this.attachmentService.findAll(cardId, userId, query);
  }

  @Post('attachments')
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

  @Put('attachments/:attachmentId')
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
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('attachmentId') attachmentId: string,
  ) {
    const userId = req.user.uid;
    return this.attachmentService.remove(userId, attachmentId);
  }
}
