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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Comment')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('/cards/:cardId')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('comments')
  @ApiOperation({
    summary: 'Get list of comments',
    description:
      'Retrieve all comments on a specific card, with optional filtering and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved comments' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Query() query: CommentQueryDto,
  ) {
    const userId = req.user.uid;
    return this.commentService.findAll(cardId, userId, query);
  }

  @Post('comments')
  @ApiOperation({
    summary: 'Create new comment',
    description:
      'Add a new comment to a card. The authenticated user will be set as the comment author.',
  })
  @ApiResponse({ status: 201, description: 'Comment successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = req.user.uid;
    return this.commentService.create(userId, cardId, dto);
  }

  @Put('comments/:commentId')
  @ApiOperation({
    summary: 'Update comment',
    description:
      'Update a comment. Only the comment author can update their own comments.',
  })
  @ApiResponse({ status: 200, description: 'Comment successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only comment author can update',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
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
  @ApiOperation({
    summary: 'Delete comment',
    description:
      'Permanently delete a comment. Only the comment author can delete their own comments.',
  })
  @ApiResponse({ status: 200, description: 'Comment successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only comment author can delete',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('commentId') commentId: string,
  ) {
    const userId = req.user.uid;
    return this.commentService.remove(userId, commentId);
  }
}
