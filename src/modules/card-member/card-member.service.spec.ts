import { Test, TestingModule } from '@nestjs/testing';
import { CardMemberService } from './card-member.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { SocketEventsService } from '../socket/socket-events.service';
import { ActivityService } from '../activity/activity.service';

describe('CardMemberService', () => {
  let service: CardMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardMemberService,
        { provide: PrismaService, useValue: {} },
        { provide: SocketEventsService, useValue: {} },
        { provide: ActivityService, useValue: {} },
      ],
    }).compile();

    service = module.get<CardMemberService>(CardMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
