import { Test, TestingModule } from '@nestjs/testing';
import { CardMemberController } from './card-member.controller';

describe('CardMemberController', () => {
  let controller: CardMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardMemberController],
    }).compile();

    controller = module.get<CardMemberController>(CardMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
