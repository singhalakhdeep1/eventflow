import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async requestPayout(organizerId: string, eventId: string) {
    // Calculate total earnings for the event
    const tickets = await this.prisma.ticket.findMany({
      where: {
        eventId,
        status: { in: ['VALID', 'USED'] },
      },
    });

    const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.purchasePrice, 0);
    const platformFee = totalAmount * 0.05; // 5% platform fee
    const payoutAmount = totalAmount - platformFee;

    const payout = await this.prisma.payoutRequest.create({
      data: {
        organizerId,
        eventId,
        amount: payoutAmount,
        status: 'PENDING',
      },
    });

    // In production, initiate Stripe transfer
    // await this.initiateStripeTransfer(payout.id, organizerId, payoutAmount);

    return payout;
  }

  async processPayout(payoutId: string) {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout || payout.status !== 'PENDING') {
      throw new Error('Payout not found or already processed');
    }

    // Simulate Stripe transfer
    const stripeTransferId = `tr_${Date.now()}`;

    const updated = await this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: 'COMPLETED',
        stripeTransferId,
        processedAt: new Date(),
      },
    });

    return updated;
  }

  async getPayoutHistory(organizerId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { organizerId },
      include: { event: true },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async getPayoutStatus(payoutId: string) {
    return this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });
  }

  async calculatePendingEarnings(organizerId: string) {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: {
        tickets: {
          where: { status: { in: ['VALID', 'USED'] } },
        },
      },
    });

    let pendingEarnings = 0;

    for (const event of events) {
      const existingPayout = await this.prisma.payoutRequest.findFirst({
        where: { eventId: event.id },
      });

      if (!existingPayout) {
        const totalAmount = event.tickets.reduce((sum, ticket) => sum + ticket.purchasePrice, 0);
        pendingEarnings += totalAmount * 0.95; // 95% after platform fee
      }
    }

    return { pendingEarnings, events: events.length };
  }
}
