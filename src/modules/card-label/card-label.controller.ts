import {
  Controller,
  Param,
  Req,
  UseGuards,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCardLabelDto } from './dtos/card-label.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CardLabelService } from './card-label.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('CardLabel')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards/:cardId')
export class CardLabelController {
  constructor(private readonly cardLabelService: CardLabelService) {}

  @Post('labels')
  @ApiOperation({
    summary: 'Add label to card',
    description:
      'Add a label to a card. The label must belong to the same board as the card.',
  })
  @ApiResponse({ status: 201, description: 'Label successfully added to card' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or label already added',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card or label not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardLabelDto,
  ) {
    const userId = req.user.uid;
    return this.cardLabelService.create(userId, cardId, dto);
  }

  @Delete('labels/:labelId')
  @ApiOperation({
    summary: 'Remove label from card',
    description:
      'Remove a label from a card. User must have editor or owner role in the board.',
  })
  @ApiResponse({
    status: 200,
    description: 'Label successfully removed from card',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Card label not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Param('labelId') labelId: string,
  ) {
    const userId = req.user.uid;
    return this.cardLabelService.remove(userId, cardId, labelId);
  }
}
