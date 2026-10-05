import { BadRequestException } from '@nestjs/common';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  const prisma: any = {
    seat: { findUnique: jest.fn(), updateMany: jest.fn() },
    ticket: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
  };
  let service: TicketsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new TicketsService(prisma);
  });

  it('does not sell a seat that was already claimed', async () => {
    prisma.seat.findUnique.mockResolvedValue({ id: 's1', eventId: 'e1', price: 50 });
    prisma.seat.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.create({ seatId: 's1', userId: 'u1' })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.ticket.create).not.toHaveBeenCalled();
  });

  it('creates a ticket priced from the seat with an unguessable QR code', async () => {
    prisma.seat.findUnique.mockResolvedValue({ id: 's1', eventId: 'e1', price: 50 });
    prisma.seat.updateMany.mockResolvedValue({ count: 1 });
    prisma.ticket.create.mockImplementation(async ({ data }: any) => data);

    const ticket: any = await service.create({ seatId: 's1', userId: 'u1' });

    expect(ticket).toMatchObject({ eventId: 'e1', seatId: 's1', userId: 'u1', purchasePrice: 50 });
    expect(ticket.qrCode).toMatch(/^TKT-[0-9a-f]{32}$/);
    expect(ticket.qrCode).not.toContain('u1');
  });

  it('only lets a VALID ticket be consumed once', async () => {
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.invalidateTicket('t1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
