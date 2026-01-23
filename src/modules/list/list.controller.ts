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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('List')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId')
export class ListController {
  constructor(private readonly listService: ListService) {}
  @Get('lists')
  @ApiOperation({
    summary: 'Get list of lists',
    description: 'Retrieve all lists within a specific board, with optional filtering and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved lists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Query() query: ListQueryDto,
  ) {
    return this.listService.findAll(boardId, req.user.uid, query);
  }

  @Post('lists')
  @ApiOperation({
    summary: 'Create list',
    description: 'Create a new list within a board. The list will be positioned at the end by default.',
  })
  @ApiResponse({ status: 201, description: 'List successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Body() dto: CreateListDto,
  ) {
    const userId = req.user.uid;
    return this.listService.create(userId, boardId, dto);
  }

  @Put('lists/:listId')
  @ApiOperation({
    summary: 'Update list',
    description: 'Update list title. User must have editor or owner role in the board.',
  })
  @ApiResponse({ status: 200, description: 'List successfully updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'List not found' })
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
  @ApiOperation({
    summary: 'Delete list',
    description: 'Permanently delete a list and all its cards. User must have editor or owner role in the board.',
  })
  @ApiResponse({ status: 200, description: 'List successfully deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
  ) {
    return this.listService.remove(req.user.uid, listId);
  }
}
