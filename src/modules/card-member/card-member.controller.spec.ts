import { Test, TestingModule } from '@nestjs/testing';
import { CardMemberController } from './card-member.controller';
import { CardMemberService } from './card-member.service';
import { AuthService } from '../auth/auth.service';

describe('CardMemberController', () => {
  let controller: CardMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardMemberController],
      providers: [
        { provide: CardMemberService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<CardMemberController>(CardMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
