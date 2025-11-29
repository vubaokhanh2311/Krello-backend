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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Board')
@ApiSecurityAuth()
@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of boards' })
  async findAll(
    @Req() req: { user: JwtPayload },
    @Query() query: BoardQueryDto,
  ) {
    return this.boardService.findAll(req.user.uid, query);
  }
  @Get(':id/members')
  @ApiOperation({
    summary: 'Get list of board members',
  })
  async getMembers(@Param('id') boardId: string) {
    return this.boardService.getMembers(boardId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get boards by id' })
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.findOne(req.user.uid, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new boards' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardService.create(req.user.uid, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update boards' })
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardService.update(req.user.uid, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete boards' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.remove(req.user.uid, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to the board' })
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
  })
  async confirmInvite(
    @Body() body: ConfirmInviteDto,
    @Req() req: { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    return this.boardService.confirmInvite(body.token, userId);
  }

  @Patch(':id/members/:userId/role')
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
  })
  async removeMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const ownerId = req.user.uid;
    return this.boardService.removeMember(boardId, userId, ownerId);
  }
}
