import { Test, TestingModule } from '@nestjs/testing';
import { CardLabelController } from './card-label.controller';

describe('CardLabelController', () => {
  let controller: CardLabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardLabelController],
    }).compile();

    controller = module.get<CardLabelController>(CardLabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
