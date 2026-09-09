import { Test, TestingModule } from '@nestjs/testing';
import { UnsplashController } from './unsplash.controller';
import { UnsplashService } from './unsplash.service';
import { AuthService } from '../auth/auth.service';

describe('UnsplashController', () => {
  let controller: UnsplashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnsplashController],
      providers: [
        { provide: UnsplashService, useValue: {} },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UnsplashController>(UnsplashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
