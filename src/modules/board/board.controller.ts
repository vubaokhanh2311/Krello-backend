import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  InviteMemberDto,
  BoardQueryDto,
  ConfirmInviteDto,
  RoleDto,
} from './dtos/board.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Board')
@ApiSecurityAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of boards',
    description:
      'Retrieve all boards accessible to the authenticated user, with optional filtering and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved boards' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async findAll(
    @Req() req: { user: JwtPayload },
    @Query() query: BoardQueryDto,
  ) {
    return this.boardService.findAll(req.user.uid, query);
  }

  @Get('joined')
  @ApiOperation({
    summary: 'Get boards joined by current user',
    description:
      'Retrieve all boards that the authenticated user is a member of, with optional filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved joined boards',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async getJoinedBoards(
    @Req() req: { user: JwtPayload },
    @Query() query: BoardQueryDto,
  ) {
    const userId = req.user.uid;
    return this.boardService.getBoardsJoinedByUser(userId, query);
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Get list of board members',
    description:
      'Retrieve all members of a specific board with their roles and user information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved board members',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async getMembers(@Param('id') boardId: string) {
    return this.boardService.getMembers(boardId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get board by id',
    description:
      'Retrieve a specific board by its ID. User must be a member of the board.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved board' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.findOne(req.user.uid, id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new board',
    description:
      'Create a new board. The authenticated user will be set as the board owner.',
  })
  @ApiResponse({ status: 201, description: 'Board successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardService.create(req.user.uid, dto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update board',
    description:
      'Update board details (name, description, background). User must have editor or owner role.',
  })
  @ApiResponse({ status: 200, description: 'Board successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardService.update(req.user.uid, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete board',
    description:
      'Delete a board permanently. Only board owners can delete boards.',
  })
  @ApiResponse({ status: 200, description: 'Board successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only board owners can delete boards',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.remove(req.user.uid, id);
  }

  @Post(':id/members')
  @ApiOperation({
    summary: 'Invite a member to the board',
    description:
      'Send an invitation to a user to join the board. The invitation will be sent via email with a confirmation token.',
  })
  @ApiResponse({ status: 201, description: 'Invitation successfully sent' })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or user already a member',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to invite members',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async inviteMember(
    @Param('id') boardId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: { user: JwtPayload },
  ) {
    const ownerId = req.user.uid;
    return this.boardService.inviteMember(boardId, ownerId, dto);
  }

  @Post('invite/confirm')
  @ApiOperation({
    summary: 'Confirm board invitation',
    description:
      'Accept a board invitation using the token received via email. The user will be added to the board with the specified role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation successfully confirmed',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired invitation token',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async confirmInvite(
    @Body() body: ConfirmInviteDto,
    @Req() req: { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    return this.boardService.confirmInvite(body.token, userId);
  }

  @Patch(':id/members/:userId/role')
  @ApiOperation({
    summary: 'Update member role in board',
    description:
      'Update the role of a board member. Only board owners can change roles. Available roles: owner, editor, viewer.',
  })
  @ApiBody({ type: RoleDto })
  @ApiResponse({ status: 200, description: 'Member role successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only board owners can update roles',
  })
  @ApiResponse({ status: 404, description: 'Board or member not found' })
  async updateMemberRole(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Body() body: RoleDto,
    @Req() req: { user: JwtPayload },
  ) {
    return this.boardService.updateMemberRole(
      boardId,
      userId,
      body.role,
      req.user.uid,
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({
    summary: 'Remove a member from the board',
    description:
      'Remove a member from the board. Only board owners can remove members.',
  })
  @ApiResponse({
    status: 200,
    description: 'Member successfully removed from board',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only board owners can remove members',
  })
  @ApiResponse({ status: 404, description: 'Board or member not found' })
  async removeMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const ownerId = req.user.uid;
    return this.boardService.removeMember(boardId, userId, ownerId);
  }
}
