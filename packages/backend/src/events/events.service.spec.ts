import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const eventData = {
        title: 'Test Event',
        venue: 'Test Venue',
        eventDate: new Date(),
        totalTickets: 100,
        organizerId: 'org-1',
      };

      mockPrismaService.event.create.mockResolvedValue({ id: '1', ...eventData });

      const result = await service.create(eventData);

      expect(prismaService.event.create).toHaveBeenCalledWith({
        data: eventData,
      });
      expect(result).toEqual({ id: '1', ...eventData });
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const events = [{ id: '1', title: 'Event 1' }];
      mockPrismaService.event.findMany.mockResolvedValue(events);

      const result = await service.findAll({});

      expect(result).toEqual(events);
    });
  });

  describe('findById', () => {
    it('should return a single event', async () => {
      const event = { id: '1', title: 'Event 1' };
      mockPrismaService.event.findUnique.mockResolvedValue(event);

      const result = await service.findById('1');

      expect(result).toEqual(event);
    });
  });
});
