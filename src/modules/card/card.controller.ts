import {
  Controller,
  UseGuards,
  Req,
  Param,
  Query,
  Get,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CardService } from './card.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardQueryDto, CreateCardDto, UpdateCardDto } from './dtos/card.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('list')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get(':listId/cards')
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
    @Query() query: CardQueryDto,
  ) {
    return this.cardService.findAll(listId, req.user.uid, query);
  }

  @Post(':listId/cards')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
    @Body() dto: CreateCardDto,
  ) {
    const userId = req.user.uid;
    return this.cardService.create(userId, listId, dto);
  }

  @Put(':listId/cards/:cardId')
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    const userId = req.user.uid;
    return this.cardService.update(userId, listId, cardId, dto);
  }

  @Delete(':listId/cards/:cardId')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.remove(req.user.uid, cardId);
  }
}
