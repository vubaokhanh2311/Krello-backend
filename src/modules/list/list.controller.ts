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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('List')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId')
export class ListController {
  constructor(private readonly listService: ListService) {}
  @Get('lists')
  @ApiOperation({ summary: 'Get list of lists' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.listService.findAll(boardId, req.user.uid, query);
  }

  @Post('lists')
  @ApiOperation({ summary: 'Create lists' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Body() dto: CreateListDto,
  ) {
    const userId = req.user.uid;
    return this.listService.create(userId, boardId, dto);
  }

  @Put('lists/:listId')
  @ApiOperation({ summary: 'Update lists' })
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('boardId') boardId: string,
    @Param('listId') listId: string,
    @Body() dto: UpdateListDto,
  ) {
    const userId = req.user.uid;
    return this.listService.update(userId, boardId, listId, dto);
  }

  @Delete('lists/:listId')
  @ApiOperation({ summary: 'Delete lists' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
  ) {
    return this.listService.remove(req.user.uid, listId);
  }
}
