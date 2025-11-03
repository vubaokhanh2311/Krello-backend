import { Test, TestingModule } from '@nestjs/testing';
import { CardMemberService } from './card-member.service';

describe('CardMemberService', () => {
  let service: CardMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardMemberService],
    }).compile();

    service = module.get<CardMemberService>(CardMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
