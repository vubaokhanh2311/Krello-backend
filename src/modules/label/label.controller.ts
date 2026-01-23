import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LabelService } from './label.service';
import {
  LabelQueryDto,
  CreateLabelDto,
  UpdateLabelDto,
} from './dtos/label.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Label')
@UseGuards(JwtAuthGuard)
@ApiSecurityAuth()
@Controller('boards/:boardId/labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of labels',
    description:
      'Retrieve all labels within a specific board, with optional filtering by name and color.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved labels' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: LabelQueryDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    return this.labelService.findAll(boardId, userId, query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create new label',
    description:
      'Create a new label for a board. Labels can be used to categorize and organize cards.',
  })
  @ApiResponse({ status: 201, description: 'Label successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Body() dto: CreateLabelDto,
  ) {
    const userId = req.user.uid;
    return this.labelService.create(userId, boardId, dto);
  }

  @Put(':labelId')
  @ApiOperation({
    summary: 'Update label',
    description:
      'Update label name and/or color. User must have editor or owner role in the board.',
  })
  @ApiResponse({ status: 200, description: 'Label successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    const userId = req.user.uid;
    return this.labelService.update(userId, boardId, labelId, dto);
  }

  @Delete(':labelId')
  @ApiOperation({
    summary: 'Delete label',
    description:
      'Permanently delete a label from a board. User must have editor or owner role.',
  })
  @ApiResponse({ status: 200, description: 'Label successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Label not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('labelId') labelId: string,
  ) {
    const userId = req.user.uid;
    return this.labelService.remove(userId, labelId);
  }
}
