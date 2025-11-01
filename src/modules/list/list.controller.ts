import {
  Controller,
  Get,
  Param,
  UseGuards,
  Post,
  Body,
  Req,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ListService } from './list.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateListDto, UpdateListDto, ListQueryDto } from './dtos/list.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('board')
export class ListController {
  constructor(private readonly listService: ListService) {}
  @Get(':boardId/lists')
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.listService.findAll(boardId, req.user.uid, query);
  }

  @Post(':boardId/lists')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Body() dto: CreateListDto,
  ) {
    const userId = req.user.uid;
    return this.listService.create(userId, boardId, dto);
  }

  @Put(':boardId/lists/:listId')
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() dto: UpdateListDto,
  ) {
    const userId = req.user.uid;
    return this.listService.update(userId, boardId, listId, dto);
  }

  @Delete(':boardId/lists/:listId')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
  ) {
    return this.listService.remove(req.user.uid, listId);
  }
}
