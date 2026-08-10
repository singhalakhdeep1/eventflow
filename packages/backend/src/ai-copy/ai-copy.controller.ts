import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AICopyService } from './ai-copy.service';

@Controller('ai-copy')
export class AiCopyController {
  constructor(private readonly aiCopyService: AICopyService) {}

  @Post('generate')
  async generateCopy(@Body() body: { eventType: string; venue: string; date: string }) {
    return this.aiCopyService.generateEventCopy(body.eventType, body.venue, body.date);
  }

  @Post('optimize/:eventId')
  async optimizeCopy(@Param('eventId') eventId: string) {
    return this.aiCopyService.optimizeEventCopy(eventId);
  }

  @Get('suggestions/:eventId')
  async getCopySuggestions(@Param('eventId') eventId: string) {
    return this.aiCopyService.getCopySuggestions(eventId);
  }

  @Post('email/:eventId')
  async generateEmailCopy(@Param('eventId') eventId: string) {
    return this.aiCopyService.generateEmailCopy(eventId);
  }
}
