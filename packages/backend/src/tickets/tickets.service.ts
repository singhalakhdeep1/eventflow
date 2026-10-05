import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const ticketInclude = { seat: true, event: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } };

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { seatId, userId } = data;

    const seat = await this.prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    // The seat may be held by the buyer (via bookSeat) or still free
    const claimed = await this.prisma.seat.updateMany({
      where: {
        id: seatId,
        isAvailable: true,
        OR: [{ isHeld: false }, { heldBy: userId }, { heldUntil: { lt: new Date() } }],
      },
      data: { isAvailable: false, isHeld: false, heldBy: null, heldUntil: null },
    });
    if (claimed.count === 0) {
      throw new BadRequestException('Seat is not available');
    }

    return this.prisma.ticket.create({
      data: {
        eventId: seat.eventId,
        seatId,
        userId,
        qrCode: this.generateQRCode(),
        purchasePrice: seat.price,
        status: 'VALID',
      },
      include: ticketInclude,
    });
  }

  async findAll(filters: any = {}) {
    return this.prisma.ticket.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.eventId && { eventId: filters.eventId }),
      },
      include: ticketInclude,
    });
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async validateTicket(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: ticketInclude,
    });

    if (!ticket) {
      throw new NotFoundException('Invalid ticket');
    }

    if (ticket.status !== 'VALID') {
      throw new BadRequestException('Ticket is not valid');
    }

    return ticket;
  }

  async invalidateTicket(id: string) {
    // Conditional update so a ticket can only be consumed once
    const result = await this.prisma.ticket.updateMany({
      where: { id, status: 'VALID' },
      data: { status: 'USED', checkedInAt: new Date() },
    });

    if (result.count === 0) {
      throw new BadRequestException('Ticket is not valid');
    }

    return this.findById(id);
  }

  // Unguessable code: the previous format embedded seat/user ids and a timestamp
  private generateQRCode(): string {
    return `TKT-${randomBytes(16).toString('hex')}`;
  }
}
