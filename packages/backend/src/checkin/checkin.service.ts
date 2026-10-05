import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

type Actor = { id: string; role: string };

@Injectable()
export class CheckinService {
  constructor(
    private prisma: PrismaService,
    private ticketsService: TicketsService,
  ) {}

  private async assertCanManageEvent(eventId: string, actor: Actor) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, select: { organizerId: true } });
    if (!event) throw new NotFoundException('Event not found');
    if (actor.role !== 'ADMIN' && event.organizerId !== actor.id) {
      throw new ForbiddenException('Only the event organizer can manage check-ins');
    }
  }

  async checkIn(qrCode: string, actor: Actor) {
    const ticket = await this.ticketsService.validateTicket(qrCode);
    await this.assertCanManageEvent(ticket.eventId, actor);

    if (ticket.checkedInAt) {
      throw new BadRequestException('Ticket has already been used');
    }

    // Atomically marks the ticket USED and stamps checkedInAt
    return this.ticketsService.invalidateTicket(ticket.id);
  }

  async getCheckinsByEvent(eventId: string, actor: Actor) {
    await this.assertCanManageEvent(eventId, actor);
    return this.prisma.ticket.findMany({
      where: { eventId, checkedInAt: { not: null } },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        seat: true,
      },
      orderBy: { checkedInAt: 'desc' },
    });
  }

  async getCheckinStats(eventId: string, actor: Actor) {
    await this.assertCanManageEvent(eventId, actor);
    const totalTickets = await this.prisma.ticket.count({
      where: { eventId, status: { in: ['VALID', 'USED'] } },
    });

    const checkedIn = await this.prisma.ticket.count({
      where: { eventId, checkedInAt: { not: null } },
    });

    return {
      totalTickets,
      checkedIn,
      pending: totalTickets - checkedIn,
      checkInRate: totalTickets > 0 ? (checkedIn / totalTickets) * 100 : 0,
    };
  }
}

