import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

describe('PayoutsService', () => {
  const past = new Date(Date.now() - 86_400_000);
  const future = new Date(Date.now() + 86_400_000);

  const prisma: any = {
    event: { findUnique: jest.fn() },
    ticket: { findMany: jest.fn() },
    payoutRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    user: { findUnique: jest.fn() },
  };
  let service: PayoutsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new PayoutsService(prisma);
  });

  describe('requestPayout', () => {
    it('rejects payouts for events owned by someone else', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'other', endDate: past });
      await expect(service.requestPayout('org', 'e1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects payouts before the event ends', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'org', endDate: future });
      await expect(service.requestPayout('org', 'e1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a second payout for the same event', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'org', endDate: past });
      prisma.payoutRequest.findFirst.mockResolvedValue({ id: 'p1' });
      await expect(service.requestPayout('org', 'e1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a payout net of the 5% platform fee, in exact cents', async () => {
      prisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'org', endDate: past });
      prisma.payoutRequest.findFirst.mockResolvedValue(null);
      prisma.ticket.findMany.mockResolvedValue([{ purchasePrice: 19.99 }, { purchasePrice: 19.99 }, { purchasePrice: 0.02 }]);
      prisma.payoutRequest.create.mockImplementation(async ({ data }: any) => data);

      const result = await service.requestPayout('org', 'e1');

      // gross 4000c, fee 200c -> 3800c
      expect(result.amount).toBe(38);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('processPayout', () => {
    it('refuses to process a payout that is not PENDING', async () => {
      prisma.payoutRequest.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.processPayout('p1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('returns the payout to PENDING when the organizer has no Stripe account', async () => {
      prisma.payoutRequest.updateMany.mockResolvedValue({ count: 1 });
      prisma.payoutRequest.findUniqueOrThrow.mockResolvedValue({ id: 'p1', organizerId: 'org', amount: 10 });
      prisma.user.findUnique.mockResolvedValue({ id: 'org', stripeAccountId: null });

      await expect(service.processPayout('p1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payoutRequest.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { status: 'PENDING' } });
    });

    it('marks the payout COMPLETED with the Stripe transfer id', async () => {
      prisma.payoutRequest.updateMany.mockResolvedValue({ count: 1 });
      prisma.payoutRequest.findUniqueOrThrow.mockResolvedValue({ id: 'p1', organizerId: 'org', eventId: 'e1', amount: 38 });
      prisma.user.findUnique.mockResolvedValue({ id: 'org', stripeAccountId: 'acct_1' });
      prisma.payoutRequest.update.mockImplementation(async ({ data }: any) => data);
      const create = jest.fn().mockResolvedValue({ id: 'tr_123' });
      (service as any).stripe = { transfers: { create } };

      const result: any = await service.processPayout('p1');

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 3800, destination: 'acct_1' }),
        { idempotencyKey: 'payout_p1' },
      );
      expect(result.status).toBe('COMPLETED');
      expect(result.stripeTransferId).toBe('tr_123');
    });

    it('marks the payout FAILED when Stripe rejects the transfer', async () => {
      prisma.payoutRequest.updateMany.mockResolvedValue({ count: 1 });
      prisma.payoutRequest.findUniqueOrThrow.mockResolvedValue({ id: 'p1', organizerId: 'org', eventId: 'e1', amount: 38 });
      prisma.user.findUnique.mockResolvedValue({ id: 'org', stripeAccountId: 'acct_1' });
      (service as any).stripe = { transfers: { create: jest.fn().mockRejectedValue(new Error('boom')) } };

      await expect(service.processPayout('p1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payoutRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
      );
    });
  });
});
