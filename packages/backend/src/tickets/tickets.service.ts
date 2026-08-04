import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { seatId, userId } = data;

    // Check if seat exists and is available
    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });

    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    if (seat.status !== 'AVAILABLE') {
      throw new BadRequestException('Seat is not available');
    }

    // Generate QR code (simplified - use QR library in production)
    const qrCode = this.generateQRCode(seatId, userId);

    // Create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        seatId,
        userId,
        qrCode,
        status: 'VALID',
      },
      include: {
        seat: {
          include: { event: true },
        },
        user: true,
      },
    });

    // Update seat status
    await this.prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'SOLD',
      },
    });

    return ticket;
  }

  async findAll(filters: any = {}) {
    return this.prisma.ticket.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.eventId && { seat: { event: { id: filters.eventId } } }),
      },
      include: {
        seat: {
          include: { event: true },
        },
        user: true,
      },
    });
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        seat: {
          include: { event: true },
        },
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async validateTicket(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        seat: {
          include: { event: true },
        },
        user: true,
      },
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
    return this.prisma.ticket.update({
      where: { id },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });
  }

  private generateQRCode(seatId: string, userId: string): string {
    // Simplified QR code generation
    return `TICKET-${seatId}-${userId}-${Date.now()}`;
  }
}
