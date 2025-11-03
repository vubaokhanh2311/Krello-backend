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
} from '@nestjs/common';
import { LabelService } from './label.service';
import {
  LabelQueryDto,
  CreateLabelDto,
  UpdateLabelDto,
} from './dtos/label.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('boards/:boardId/labels')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @Get()
  findAll(
    @Param('boardId') boardId: string,
    @Query() query: LabelQueryDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    const userId = req.user.uid;
    return this.labelService.findAll(boardId, userId, query);
  }

  @Post()
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('boardId') boardId: string,
    @Body() dto: CreateLabelDto,
  ) {
    const userId = req.user.uid;
    return this.labelService.create(userId, boardId, dto);
  }

  @Put(':labelId')
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('boardId') boardId: string,
    @Param('labelId') labelId: string,
    @Body() dto: UpdateLabelDto,
  ) {
    const userId = req.user.uid;
    return this.labelService.update(userId, boardId, labelId, dto);
  }

  @Delete(':listId')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('labelId') labelId: string,
  ) {
    const userId = req.user.uid;
    return this.labelService.remove(userId, labelId);
  }
}
