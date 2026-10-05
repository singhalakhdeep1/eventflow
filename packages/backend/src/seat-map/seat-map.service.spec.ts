import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';

describe('SeatMapService', () => {
  const prisma: any = {
    seat: { updateMany: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
    event: { findUnique: jest.fn(), update: jest.fn() },
    ticket: { count: jest.fn() },
  };
  let service: SeatMapService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new SeatMapService(prisma);
  });

  it('rejects empty and oversized holds', async () => {
    await expect(service.holdSeats('e1', [], 'u1')).rejects.toBeInstanceOf(BadRequestException);
    const many = Array.from({ length: 11 }, (_, i) => `s${i}`);
    await expect(service.holdSeats('e1', many, 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('holds all requested seats atomically with an expiry', async () => {
    prisma.seat.updateMany.mockResolvedValue({ count: 2 });
    const result = await service.holdSeats('e1', ['a', 'b', 'a'], 'u1');
    expect(result.seatIds).toEqual(['a', 'b']);
    expect(result.heldUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it('rolls back a partial hold and reports unavailability', async () => {
    prisma.seat.updateMany.mockResolvedValueOnce({ count: 0 }); // free expired
    prisma.seat.updateMany.mockResolvedValueOnce({ count: 1 }); // claim only 1 of 2
    prisma.seat.updateMany.mockResolvedValueOnce({ count: 1 }); // rollback
    await expect(service.holdSeats('e1', ['a', 'b'], 'u1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.seat.updateMany).toHaveBeenCalledTimes(3);
  });

  it('only releases seats held by the caller', async () => {
    prisma.seat.updateMany.mockResolvedValue({ count: 1 });
    await service.releaseSeats(['a'], 'u1');
    expect(prisma.seat.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ heldBy: 'u1' }) }),
    );
  });

  it('does not let other organizers configure the seat map', async () => {
    prisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'owner', basePrice: 10 });
    await expect(service.configureSeatMap('e1', {}, { id: 'x', role: 'ORGANIZER' })).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not expose who holds a seat', async () => {
    prisma.seat.updateMany.mockResolvedValue({ count: 0 });
    prisma.seat.findMany.mockResolvedValue([{ id: 'a', section: 'A', row: '1', seatNumber: '1', isHeld: true, heldBy: 'u9', heldUntil: new Date() }]);
    const map = await service.getSeatMap('e1');
    expect(map.sections[0].seats[0]).not.toHaveProperty('heldBy');
  });
});
