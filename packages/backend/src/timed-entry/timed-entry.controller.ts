import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TimedEntryService } from './timed-entry.service';

@Controller('timed-entry')
export class TimedEntryController {
  constructor(private readonly timedEntryService: TimedEntryService) {}

  @Post('validate/:ticketId')
  async validateTimedEntry(@Param('ticketId') ticketId: string) {
    return this.timedEntryService.validateTimedEntry(ticketId);
  }

  @Post('configure/:eventId')
  async configureTimedEntry(@Param('eventId') eventId: string, @Body() body: any) {
    return this.timedEntryService.configureTimedEntry(eventId, body);
  }

  @Get('status/:ticketId')
  async getEntryStatus(@Param('ticketId') ticketId: string) {
    return this.timedEntryService.getEntryStatus(ticketId);
  }

  @Post('grant/:ticketId')
  async grantEntry(@Param('ticketId') ticketId: string) {
    return this.timedEntryService.grantEntry(ticketId);
  }
}
