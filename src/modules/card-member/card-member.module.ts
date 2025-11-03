import { Module } from '@nestjs/common';
import { CardMemberController } from './card-member.controller';
import { CardMemberService } from './card-member.service';

@Module({
  controllers: [CardMemberController],
  providers: [CardMemberService],
})
export class CardMemberModule {}
