import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

const PLATFORM_FEE_RATE = 0.05;

@Injectable()
export class PayoutsService {
  private stripe: Stripe | null = null;

  constructor(private prisma: PrismaService) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new BadRequestException('Payments are not configured');
      }
      this.stripe = new Stripe(key, { apiVersion: '2023-10-16' });
    }
    return this.stripe;
  }

  private async paidTickets(eventId: string) {
    return this.prisma.ticket.findMany({
      where: { eventId, status: { in: ['VALID', 'USED'] } },
    });
  }

  // Work in cents to avoid floating point drift
  private toNetCents(tickets: { purchasePrice: number }[]) {
    const grossCents = tickets.reduce((sum, t) => sum + Math.round(t.purchasePrice * 100), 0);
    return grossCents - Math.round(grossCents * PLATFORM_FEE_RATE);
  }

  async requestPayout(organizerId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.organizerId !== organizerId) {
      throw new ForbiddenException('You can only request payouts for your own events');
    }
    if (event.endDate > new Date()) {
      throw new BadRequestException('Payouts can only be requested after the event has ended');
    }

    const existing = await this.prisma.payoutRequest.findFirst({
      where: { eventId, status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } },
    });
    if (existing) throw new BadRequestException('A payout already exists for this event');

    const netCents = this.toNetCents(await this.paidTickets(eventId));
    if (netCents <= 0) throw new BadRequestException('No earnings available for payout');

    return this.prisma.payoutRequest.create({
      data: { organizerId, eventId, amount: netCents / 100, status: 'PENDING' },
    });
  }

  async processPayout(payoutId: string) {
    // Claim the payout atomically so concurrent calls cannot double-pay
    const claim = await this.prisma.payoutRequest.updateMany({
      where: { id: payoutId, status: 'PENDING' },
      data: { status: 'PROCESSING' },
    });
    if (claim.count === 0) {
      throw new BadRequestException('Payout not found or already processed');
    }

    const payout = await this.prisma.payoutRequest.findUniqueOrThrow({ where: { id: payoutId } });
    const organizer = await this.prisma.user.findUnique({ where: { id: payout.organizerId } });

    if (!organizer?.stripeAccountId) {
      await this.prisma.payoutRequest.update({ where: { id: payoutId }, data: { status: 'PENDING' } });
      throw new BadRequestException('Organizer has not connected a Stripe account');
    }

    try {
      const transfer = await this.getStripe().transfers.create(
        {
          amount: Math.round(payout.amount * 100),
          currency: 'usd',
          destination: organizer.stripeAccountId,
          metadata: { payoutId, eventId: payout.eventId },
        },
        { idempotencyKey: `payout_${payoutId}` },
      );

      return await this.prisma.payoutRequest.update({
        where: { id: payoutId },
        data: { status: 'COMPLETED', stripeTransferId: transfer.id, processedAt: new Date() },
      });
    } catch (error) {
      await this.prisma.payoutRequest.update({
        where: { id: payoutId },
        data: { status: 'FAILED', processedAt: new Date() },
      });
      throw new BadRequestException('Stripe transfer failed');
    }
  }

  async getPayoutHistory(organizerId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { organizerId },
      include: { event: true },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async getPayoutStatus(payoutId: string, requesterId: string, isAdmin: boolean) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundException('Payout not found');
    if (!isAdmin && payout.organizerId !== requesterId) throw new ForbiddenException();
    return payout;
  }

  async calculatePendingEarnings(organizerId: string) {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: { tickets: { where: { status: { in: ['VALID', 'USED'] } } } },
    });

    let pendingCents = 0;
    for (const event of events) {
      const existingPayout = await this.prisma.payoutRequest.findFirst({
        where: { eventId: event.id, status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } },
      });
      if (!existingPayout) pendingCents += this.toNetCents(event.tickets);
    }

    return { pendingEarnings: pendingCents / 100, events: events.length };
  }
}
