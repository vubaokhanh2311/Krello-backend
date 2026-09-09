import { Test, TestingModule } from '@nestjs/testing';
import { LabelService } from './label.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

describe('LabelService', () => {
  let service: LabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LabelService,
        { provide: PrismaService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
        { provide: ActivityService, useValue: {} },
      ],
    }).compile();

    service = module.get<LabelService>(LabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
