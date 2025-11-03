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

@UseGuards(JwtAuthGuard)
@Controller('card')
export class CardMemberController {
  constructor(private readonly cardMemberService: CardMemberService) {}

  @Post(':cardId/members')
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardMenberDto,
  ) {
    const userId = req.user.uid;
    return this.cardMemberService.create(userId, cardId, dto);
  }

  @Delete(':cardId/members/:memberId')
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('memberId') memberId: string,
  ) {
    return this.cardMemberService.remove(req.user.uid, memberId);
  }
}
