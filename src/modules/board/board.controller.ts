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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardService } from './board.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  InviteMemberDto,
  BoardQueryDto,
} from './dtos/board.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async findAll(
    @Req() req: { user: JwtPayload },
    @Query() query: BoardQueryDto,
  ) {
    return this.boardService.findAll(req.user.uid, query);
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.findOne(req.user.uid, id);
  }

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardService.create(req.user.uid, dto);
  }

  @Put(':id')
  async update(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardService.update(req.user.uid, id, dto);
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id') id: string,
  ) {
    return this.boardService.remove(req.user.uid, id);
  }

  @Post(':id/members')
  async inviteMember(
    @Param('id') boardId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: { user: JwtPayload },
  ) {
    const ownerId = req.user.uid;
    return this.boardService.inviteMember(boardId, ownerId, dto);
  }

  @Post('invite/confirm')
  async confirmInvite(
    @Query('token') token: string,
    @Req() req: { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    return this.boardService.confirmInvite(token, userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') boardId: string,
    @Param('userId') userId: string,
    @Req() req: { user: JwtPayload },
  ) {
    const ownerId = req.user.uid;
    return this.boardService.removeMember(boardId, userId, ownerId);
  }

  @Get(':id/members')
  async getMembers(@Param('id') boardId: string) {
    return this.boardService.getMembers(boardId);
  }
}
