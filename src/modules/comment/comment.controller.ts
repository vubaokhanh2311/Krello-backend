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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CommentQueryDto,
  CreateCommentDto,
  UpdateCommentDto,
} from './dtos/comment.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('/cards/:cardId')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('comments')
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Query() query: CommentQueryDto,
  ) {
    const userId = req.user.uid;
    return this.commentService.findAll(cardId, userId, query);
  }

  @Post('comments')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = req.user.uid;
    return this.commentService.create(userId, cardId, dto);
  }

  @Put('comments/:commentId')
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('commentId') commentId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    const userId = req.user.uid;
    return this.commentService.update(userId, commentId, cardId, dto);
  }

  @Delete('comments/:commentId')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('commentId') commentId: string,
  ) {
    const userId = req.user.uid;
    return this.commentService.remove(userId, commentId);
  }
}
