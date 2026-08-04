import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkin')
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  scanTicket(@Body() body: { qrCode: string }) {
    return this.checkinService.checkIn(body.qrCode);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  getEventCheckins(@Param('eventId') eventId: string) {
    return this.checkinService.getCheckinsByEvent(eventId);
  }

  @Get('event/:eventId/stats')
  @UseGuards(JwtAuthGuard)
  getEventStats(@Param('eventId') eventId: string) {
    return this.checkinService.getCheckinStats(eventId);
  }
}
