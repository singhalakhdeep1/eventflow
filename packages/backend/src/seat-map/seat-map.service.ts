import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeatMapService {
  constructor(private prisma: PrismaService) {}

  async generateSeatMap(eventId: string, configuration: any) {
    const { sections, rowsPerSection, seatsPerRow } = configuration;
    const seats = [];

    for (const section of sections) {
      for (let row = 1; row <= rowsPerSection; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
          const price = this.calculatePrice(section, row, configuration.basePrice);
          seats.push({
            eventId,
            section: section.name,
            row: row.toString(),
            seatNumber: seat.toString(),
            price,
            isAvailable: true,
          });
        }
      }
    }

    await this.prisma.seat.createMany({
      data: seats,
      skipDuplicates: true,
    });

    return { created: seats.length };
  }

  private calculatePrice(section: any, row: number, basePrice: number): number {
    let price = basePrice;
    
    // Section pricing tiers
    if (section.tier === 'premium') price *= 1.5;
    else if (section.tier === 'vip') price *= 2;
    
    // Row pricing (closer to stage = more expensive)
    const rowMultiplier = 1 + (rowsPerSection - row) * 0.05;
    price *= rowMultiplier;
    
    return Math.round(price * 100) / 100;
  }

  async getSeatMap(eventId: string) {
    const seats = await this.prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ section: 'asc' }, { row: 'asc' }, { seatNumber: 'asc' }],
    });

    const grouped = seats.reduce((acc, seat) => {
      if (!acc[seat.section]) {
        acc[seat.section] = [];
      }
      acc[seat.section].push(seat);
      return acc;
    }, {});

    return {
      eventId,
      sections: Object.keys(grouped).map((section) => ({
        name: section,
        seats: grouped[section],
      })),
    };
  }

  async holdSeat(seatId: string, userId: string, holdDurationMinutes: number = 15) {
    const seat = await this.prisma.seat.findUnique({
      where: { id: seatId },
    });

    if (!seat) {
      throw new BadRequestException('Seat not found');
    }

    if (!seat.isAvailable || seat.isHeld) {
      throw new BadRequestException('Seat is not available');
    }

    const heldUntil = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

    const updated = await this.prisma.seat.update({
      where: { id: seatId },
      data: {
        isHeld: true,
        heldBy: userId,
      },
    });

    // Schedule release of hold
    setTimeout(async () => {
      await this.releaseSeat(seatId);
    }, holdDurationMinutes * 60 * 1000);

    return updated;
  }

  async releaseSeat(seatId: string) {
    return this.prisma.seat.update({
      where: { id: seatId },
      data: {
        isHeld: false,
        heldBy: null,
      },
    });
  }

  async bookSeat(seatId: string, ticketId: string) {
    return this.prisma.seat.update({
      where: { id: seatId },
      data: {
        isAvailable: false,
        isHeld: false,
        heldBy: null,
      },
    });
  }

  async getAvailableSeats(eventId: string) {
    return this.prisma.seat.findMany({
      where: {
        eventId,
        isAvailable: true,
        isHeld: false,
      },
    });
  }
}
