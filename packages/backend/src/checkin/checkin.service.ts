import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class CheckinService {
  constructor(
    private prisma: PrismaService,
    private ticketsService: TicketsService,
  ) {}

  async checkIn(qrCode: string) {
    // Validate ticket
    const ticket = await this.ticketsService.validateTicket(qrCode);

    if (ticket.status === 'USED') {
      throw new BadRequestException('Ticket has already been used');
    }

    // Invalidate ticket
    await this.ticketsService.invalidateTicket(ticket.id);

    // Create check-in record
    const checkin = await this.prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        userId: ticket.userId,
        eventId: ticket.seat.eventId,
        checkedInAt: new Date(),
      },
      include: {
        ticket: {
          include: {
            seat: {
              include: { event: true },
            },
            user: true,
          },
        },
      },
    });

    return checkin;
  }

  async getCheckinsByEvent(eventId: string) {
    return this.prisma.checkIn.findMany({
      where: { eventId },
      include: {
        ticket: {
          include: {
            user: true,
            seat: true,
          },
        },
      },
      orderBy: {
        checkedInAt: 'desc',
      },
    });
  }

  async getCheckinStats(eventId: string) {
    const totalTickets = await this.prisma.ticket.count({
      where: {
        seat: { eventId },
      },
    });

    const checkedIn = await this.prisma.checkIn.count({
      where: { eventId },
    });

    return {
      totalTickets,
      checkedIn,
      pending: totalTickets - checkedIn,
      checkInRate: totalTickets > 0 ? (checkedIn / totalTickets) * 100 : 0,
    };
  }
}
