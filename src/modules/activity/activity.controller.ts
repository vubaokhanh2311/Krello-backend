import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityQueryDto } from './dtos/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Activity')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('/boards/:boardId/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({
    summary: 'Get activities of a board',
    description: 'Retrieve activity history for a board. Activities include all actions like card creation, updates, comments, member changes, etc. Supports filtering by action type, target type, and user.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved activities' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
  @ApiResponse({ status: 404, description: 'Board not found' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Query() query: ActivityQueryDto,
  ) {
    const userId = req.user.uid;
    return this.activityService.findAll(boardId, userId, query);
  }
}

