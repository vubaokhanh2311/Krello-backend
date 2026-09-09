import { Test, TestingModule } from '@nestjs/testing';
import { CardLabelService } from './card-label.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

describe('CardLabelService', () => {
  let service: CardLabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardLabelService,
        { provide: PrismaService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
        { provide: ActivityService, useValue: {} },
      ],
    }).compile();

    service = module.get<CardLabelService>(CardLabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
