import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkin')
@UseGuards(JwtAuthGuard)
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  @Post('scan')
  scanTicket(@Request() req, @Body() body: { qrCode: string }) {
    return this.checkinService.checkIn(body.qrCode, req.user);
  }

  @Get('event/:eventId')
  getEventCheckins(@Request() req, @Param('eventId') eventId: string) {
    return this.checkinService.getCheckinsByEvent(eventId, req.user);
  }

  @Get('event/:eventId/stats')
  getEventStats(@Request() req, @Param('eventId') eventId: string) {
    return this.checkinService.getCheckinStats(eventId, req.user);
  }
}
