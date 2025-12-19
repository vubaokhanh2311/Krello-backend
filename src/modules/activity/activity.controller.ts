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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Activity')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('/boards/:boardId/activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get activities of a board' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Query() query: ActivityQueryDto,
  ) {
    const userId = req.user.uid;
    return this.activityService.findAll(boardId, userId, query);
  }
}

