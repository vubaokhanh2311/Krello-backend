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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiSecurityAuth } from '../../common/decorators/swagger.decorator';

@ApiTags('CardMember')
@ApiSecurityAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards/:cardId')
export class CardMemberController {
  constructor(private readonly cardMemberService: CardMemberService) {}

  @Post('members')
  @ApiOperation({ summary: 'Create add members with card' })
  async create(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardMenberDto,
  ) {
    const userId = req.user.uid;
    return this.cardMemberService.create(userId, cardId, dto);
  }

  @Delete('members/:memberId')
  @ApiOperation({ summary: 'Delete members with card' })
  async remove(
    @Req() req: Request & { user: JwtPayload },
    @Param('cardId') cardId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.cardMemberService.remove(req.user.uid, memberId, cardId);
  }
}
