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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('CardLabel')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards/:cardId')
export class CardLabelController {
  constructor(private readonly cardLabelService: CardLabelService) {}

  @Post('labels')
  @ApiOperation({ summary: 'Create add labels with card' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardLabelDto,
  ) {
    const userId = req.user.uid;
    return this.cardLabelService.create(userId, cardId, dto);
  }

  @Delete('labels/:labelId')
  @ApiOperation({ summary: 'Delete labels with card' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Param('labelId') labelId: string,
  ) {
    const userId = req.user.uid;
    return this.cardLabelService.remove(userId, cardId, labelId);
  }
}
