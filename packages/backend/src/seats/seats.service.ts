import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.seat.create({
      data,
      include: { event: true },
    });
  }

  async findAll(filters: any = {}) {
    return this.prisma.seat.findMany({
      where: {
        ...(filters.eventId && { eventId: filters.eventId }),
        ...(filters.status && { status: filters.status }),
      },
      include: { event: true },
    });
  }

  async findById(id: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: { event: true, ticket: true },
    });

    if (!seat) {
      throw new NotFoundException('Seat not found');
    }

    return seat;
  }

  async update(id: string, data: any) {
    return this.prisma.seat.update({
      where: { id },
      data,
      include: { event: true },
    });
  }

  async bookSeat(seatId: string, userId: string) {
    const seat = await this.findById(seatId);

    if (seat.status !== 'AVAILABLE') {
      throw new BadRequestException('Seat is not available');
    }

    return this.prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'RESERVED',
        reservedBy: userId,
        reservedAt: new Date(),
      },
    });
  }

  async releaseSeat(seatId: string) {
    return this.prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'AVAILABLE',
        reservedBy: null,
        reservedAt: null,
      },
    });
  }

  async getAvailableSeats(eventId: string) {
    return this.prisma.seat.findMany({
      where: {
        eventId,
        status: 'AVAILABLE',
      },
      include: { event: true },
    });
  }
}
