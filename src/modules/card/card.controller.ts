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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('Card')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('lists/:listId')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get('cards')
  @ApiOperation({
    summary: 'Get list of cards',
    description:
      'Retrieve all cards within a specific list, with optional filtering and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved cards' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'List not found' })
  async findAll(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
    @Query() query: CardQueryDto,
  ) {
    return this.cardService.findAll(listId, req.user.uid, query);
  }

  @Post('cards')
  @ApiOperation({
    summary: 'Create new card',
    description:
      'Create a new card within a list. Optionally set description, due date, and position.',
  })
  @ApiResponse({ status: 201, description: 'Card successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'List not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('listId') listId: string,
    @Body() dto: CreateCardDto,
  ) {
    const userId = req.user.uid;
    return this.cardService.create(userId, listId, dto);
  }

  @Put('cards/:cardId')
  @ApiOperation({
    summary: 'Update card',
    description:
      'Update card details including title, description, due date, position, or move to another list. User must have editor or owner role.',
  })
  @ApiResponse({ status: 200, description: 'Card successfully updated' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async update(
    @Req() req: Request & { user: { uid: string } },
    @Param('listId') listId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardDto,
  ) {
    const userId = req.user.uid;
    return this.cardService.update(userId, listId, cardId, dto);
  }

  @Delete('cards/:cardId')
  @ApiOperation({
    summary: 'Delete card',
    description:
      'Permanently delete a card. User must have editor or owner role in the board.',
  })
  @ApiResponse({ status: 200, description: 'Card successfully deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.remove(req.user.uid, cardId);
  }
}
