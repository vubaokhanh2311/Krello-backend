import { Test, TestingModule } from '@nestjs/testing';
import { LabelController } from './label.controller';
import { LabelService } from './label.service';
import { AuthService } from '../auth/auth.service';

describe('LabelController', () => {
  let controller: LabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelController],
      providers: [
        { provide: LabelService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<LabelController>(LabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
