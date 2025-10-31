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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BoardService } from './board.service';
import { CreateBoardDto, UpdateBoardDto } from './dtos/board.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  async findAll(@Req() req: Request & { user: JwtPayload }) {
    return this.boardService.findAll(req.user.uid);
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
}
