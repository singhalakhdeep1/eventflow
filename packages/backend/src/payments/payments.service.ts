import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_key', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        seat: {
          include: { event: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(ticket.seat.event.price * 100),
      currency: 'usd',
      metadata: {
        ticketId,
      },
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        amount: ticket.seat.event.price,
        currency: 'USD',
        status: 'PENDING',
        stripeId: paymentIntent.id,
        method: 'card',
        ticketId,
        userId: ticket.userId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const payment = await this.prisma.payment.update({
        where: { stripeId: paymentIntentId },
        data: {
          status: 'COMPLETED',
        },
      });

      return payment;
    }

    throw new BadRequestException('Payment not successful');
  }

  async processRefund(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Payment cannot be refunded');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripeId,
    });

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    return updatedPayment;
  }
}
