import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SafeTixService } from './safetix.service';

@Controller('safetix')
export class SafetixController {
  constructor(private readonly safetixService: SafeTixService) {}

  @Post('verify/:ticketId')
  async verifyTicket(@Param('ticketId') ticketId: string) {
    return this.safetixService.verifyTicket(ticketId);
  }

  @Post('report-suspicious')
  async reportSuspiciousActivity(@Body() body: { ticketId: string; reason: string }) {
    return this.safetixService.reportSuspiciousActivity(body.ticketId, body.reason);
  }

  @Get('status/:ticketId')
  async getTicketSafetyStatus(@Param('ticketId') ticketId: string) {
    return this.safetixService.getTicketSafetyStatus(ticketId);
  }

  @Post('blacklist/:ticketId')
  async blacklistTicket(@Param('ticketId') ticketId: string) {
    return this.safetixService.blacklistTicket(ticketId);
  }

  @Get('event/:eventId')
  async getEventSafetyReport(@Param('eventId') eventId: string) {
    return this.safetixService.getEventSafetyReport(eventId);
  }
}
