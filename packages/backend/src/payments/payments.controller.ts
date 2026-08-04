import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  createPaymentIntent(@Body() body: { ticketId: string }) {
    return this.paymentsService.createPaymentIntent(body.ticketId);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.paymentsService.confirmPayment(body.paymentIntentId);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard)
  processRefund(@Body() body: { paymentId: string }) {
    return this.paymentsService.processRefund(body.paymentId);
  }
}
