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
import { CreateCardMenberDto } from './dtos/card-member.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CardMemberService } from './card-member.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('CardMember')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards/:cardId')
export class CardMemberController {
  constructor(private readonly cardMemberService: CardMemberService) {}

  @Post('members')
  @ApiOperation({
    summary: 'Add member to card',
    description:
      'Add a user as a member to a card. The user must be a member of the board containing the card.',
  })
  @ApiResponse({
    status: 201,
    description: 'Member successfully added to card',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already a member',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({ status: 404, description: 'Card or user not found' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardMenberDto,
  ) {
    const userId = req.user.uid;
    return this.cardMemberService.create(userId, cardId, dto);
  }

  @Delete('members/:memberId')
  @ApiOperation({
    summary: 'Remove member from card',
    description:
      'Remove a member from a card. User must have editor or owner role in the board.',
  })
  @ApiResponse({
    status: 200,
    description: 'Member successfully removed from card',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Card member not found' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.cardMemberService.remove(req.user.uid, memberId, cardId);
  }
}
