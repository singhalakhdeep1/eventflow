import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('purchase')
  purchase(@Request() req, @Body() data: { seatId: string }) {
    return this.ticketsService.create({
      seatId: data.seatId,
      userId: req.user.id,
    });
  }

  @Get('my-tickets')
  getMyTickets(@Request() req) {
    return this.ticketsService.findAll({ userId: req.user.id });
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const ticket = await this.ticketsService.findById(id);
    const isOwner = ticket.userId === req.user.id;
    const isEventStaff = req.user.role === 'ADMIN' || ticket.event?.organizerId === req.user.id;
    if (!isOwner && !isEventStaff) {
      throw new ForbiddenException();
    }
    return ticket;
  }

  @Post('validate')
  validate(@Request() req, @Body() body: { qrCode: string }) {
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException();
    }
    return this.ticketsService.validateTicket(body.qrCode);
  }

  @Post(':id/invalidate')
  async invalidate(@Request() req, @Param('id') id: string) {
    const ticket = await this.ticketsService.findById(id);
    if (req.user.role !== 'ADMIN' && ticket.event?.organizerId !== req.user.id) {
      throw new ForbiddenException();
    }
    return this.ticketsService.invalidateTicket(id);
  }
}
