import { Test, TestingModule } from '@nestjs/testing';
import { CardLabelService } from './card-label.service';

describe('CardLabelService', () => {
  let service: CardLabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardLabelService],
    }).compile();

    service = module.get<CardLabelService>(CardLabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
