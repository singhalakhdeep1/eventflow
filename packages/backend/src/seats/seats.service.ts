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
        ...(filters.status === 'AVAILABLE' && { isAvailable: true, isHeld: false }),
        ...(filters.status === 'RESERVED' && { isHeld: true }),
        ...(filters.status === 'SOLD' && { isAvailable: false, isHeld: false }),
      },
      include: { event: true },
    });
  }

  async findById(id: string) {
    const seat = await this.prisma.seat.findUnique({
      where: { id },
      include: { event: true, tickets: true },
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
    // Atomic claim: only one caller can flip an available seat to held
    const claimed = await this.prisma.seat.updateMany({
      where: { id: seatId, isAvailable: true, isHeld: false },
      data: { isHeld: true, heldBy: userId },
    });

    if (claimed.count === 0) {
      await this.findById(seatId);
      throw new BadRequestException('Seat is not available');
    }

    return this.findById(seatId);
  }

  async releaseSeat(seatId: string) {
    return this.prisma.seat.update({
      where: { id: seatId },
      data: { isHeld: false, heldBy: null },
    });
  }

  async getAvailableSeats(eventId: string) {
    return this.prisma.seat.findMany({
      where: { eventId, isAvailable: true, isHeld: false },
      include: { event: true },
    });
  }
}
