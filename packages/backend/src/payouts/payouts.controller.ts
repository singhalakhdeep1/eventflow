import { Controller, Get, Post, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  async requestPayout(@Req() req: any, @Body() body: { eventId: string }) {
    return this.payoutsService.requestPayout(req.user.id, body.eventId);
  }

  @Get('history')
  async getPayoutHistory(@Req() req: any) {
    return this.payoutsService.getPayoutHistory(req.user.id);
  }

  @Get('status/:payoutId')
  async getPayoutStatus(@Req() req: any, @Param('payoutId') payoutId: string) {
    return this.payoutsService.getPayoutStatus(payoutId, req.user.id, req.user.role === 'ADMIN');
  }

  @Post('process/:payoutId')
  async processPayout(@Req() req: any, @Param('payoutId') payoutId: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
    return this.payoutsService.processPayout(payoutId);
  }

  @Get('pending')
  async calculatePendingEarnings(@Req() req: any) {
    return this.payoutsService.calculatePendingEarnings(req.user.id);
  }
}
