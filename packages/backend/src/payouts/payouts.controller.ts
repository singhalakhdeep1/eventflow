import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  async requestPayout(@Body() body: { organizerId: string; eventId: string }) {
    return this.payoutsService.requestPayout(body.organizerId, body.eventId);
  }

  @Get('history/:organizerId')
  async getPayoutHistory(@Param('organizerId') organizerId: string) {
    return this.payoutsService.getPayoutHistory(organizerId);
  }

  @Get('status/:payoutId')
  async getPayoutStatus(@Param('payoutId') payoutId: string) {
    return this.payoutsService.getPayoutStatus(payoutId);
  }

  @Post('process/:payoutId')
  async processPayout(@Param('payoutId') payoutId: string) {
    return this.payoutsService.processPayout(payoutId);
  }

  @Get('pending/:organizerId')
  async calculatePendingEarnings(@Param('organizerId') organizerId: string) {
    return this.payoutsService.calculatePendingEarnings(organizerId);
  }
}
