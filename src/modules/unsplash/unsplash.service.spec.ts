import { Test, TestingModule } from '@nestjs/testing';
import { UnsplashService } from './unsplash.service';
import { HttpService } from '@nestjs/axios';

describe('UnsplashService', () => {
  let service: UnsplashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnsplashService,
        { provide: HttpService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<UnsplashService>(UnsplashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
