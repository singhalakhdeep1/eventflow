import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchase(@Request() req, @Body() data: { seatId: string }) {
    return this.ticketsService.create({
      ...data,
      userId: req.user.id,
    });
  }

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  getMyTickets(@Request() req) {
    return this.ticketsService.findAll({ userId: req.user.id });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Post('validate')
  validate(@Body() body: { qrCode: string }) {
    return this.ticketsService.validateTicket(body.qrCode);
  }

  @Post(':id/invalidate')
  @UseGuards(JwtAuthGuard)
  invalidate(@Param('id') id: string) {
    return this.ticketsService.invalidateTicket(id);
  }
}
