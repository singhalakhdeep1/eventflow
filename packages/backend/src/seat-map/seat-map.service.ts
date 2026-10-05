import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const HOLD_MINUTES = 15;
const MAX_SEATS_PER_HOLD = 10;

type Actor = { id: string; role: string };

@Injectable()
export class SeatMapService {
  constructor(private prisma: PrismaService) {}

  // Holds expire lazily: expired ones are cleared on every read/hold instead of via in-process timers,
  // so they survive restarts and work with multiple instances.
  private async freeExpiredHolds(eventId?: string) {
    await this.prisma.seat.updateMany({
      where: { ...(eventId && { eventId }), isHeld: true, heldUntil: { lt: new Date() } },
      data: { isHeld: false, heldBy: null, heldUntil: null },
    });
  }

  async holdSeats(eventId: string, seatIds: string[], userId: string) {
    if (!Array.isArray(seatIds) || seatIds.length === 0 || seatIds.length > MAX_SEATS_PER_HOLD) {
      throw new BadRequestException(`Select between 1 and ${MAX_SEATS_PER_HOLD} seats`);
    }
    const uniqueIds = [...new Set(seatIds)];
    await this.freeExpiredHolds(eventId);

    const heldUntil = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const claimed = await this.prisma.seat.updateMany({
      where: { id: { in: uniqueIds }, eventId, isAvailable: true, isHeld: false },
      data: { isHeld: true, heldBy: userId, heldUntil },
    });

    // All-or-nothing: undo a partial hold
    if (claimed.count !== uniqueIds.length) {
      await this.prisma.seat.updateMany({
        where: { id: { in: uniqueIds }, heldBy: userId, heldUntil },
        data: { isHeld: false, heldBy: null, heldUntil: null },
      });
      throw new BadRequestException('One or more seats are no longer available');
    }

    return { seatIds: uniqueIds, heldUntil };
  }

  async releaseSeats(seatIds: string[], userId: string) {
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      throw new BadRequestException('seatIds is required');
    }
    const result = await this.prisma.seat.updateMany({
      where: { id: { in: seatIds }, heldBy: userId, isAvailable: true },
      data: { isHeld: false, heldBy: null, heldUntil: null },
    });
    return { released: result.count };
  }

  async configureSeatMap(eventId: string, body: any, actor: Actor) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    if (actor.role !== 'ADMIN' && event.organizerId !== actor.id) {
      throw new ForbiddenException('You can only configure your own events');
    }
    if (await this.prisma.ticket.count({ where: { eventId } })) {
      throw new BadRequestException('Seat map cannot change after tickets are sold');
    }

    const sectionCount = Math.min(Math.max(Number(body?.sectionCount ?? 4), 1), 26);
    const rowsPerSection = Math.min(Math.max(Number(body?.rowsPerSection ?? 8), 1), 50);
    const seatsPerRow = Math.min(Math.max(Number(body?.seatsPerRow ?? 12), 1), 50);
    const basePrice = Number.isFinite(Number(body?.basePrice)) ? Number(body.basePrice) : event.basePrice;
    const tiers = ['vip', 'premium'];

    const sections = Array.from({ length: sectionCount }, (_, i) => ({
      name: String.fromCharCode(65 + i),
      tier: tiers[i] ?? 'standard',
    }));

    await this.prisma.seat.deleteMany({ where: { eventId } });
    const created = await this.generateSeatMap(eventId, { sections, rowsPerSection, seatsPerRow, basePrice });
    const totalSeats = sectionCount * rowsPerSection * seatsPerRow;
    await this.prisma.event.update({ where: { id: eventId }, data: { totalSeats, availableSeats: totalSeats } });

    return { eventId, sectionCount, rowsPerSection, seatsPerRow, ...created };
  }

  async generateSeatMap(eventId: string, configuration: any) {
    const { sections, rowsPerSection, seatsPerRow } = configuration;
    const seats = [];

    for (const section of sections) {
      for (let row = 1; row <= rowsPerSection; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
          seats.push({
            eventId,
            section: section.name,
            row: row.toString(),
            seatNumber: seat.toString(),
            price: this.calculatePrice(section, row, configuration.basePrice),
            isAvailable: true,
          });
        }
      }
    }

    await this.prisma.seat.createMany({ data: seats, skipDuplicates: true });
    return { created: seats.length };
  }

  private calculatePrice(section: any, row: number, basePrice: number): number {
    let price = basePrice;

    if (section.tier === 'premium') price *= 1.5;
    else if (section.tier === 'vip') price *= 2;

    // Rows closer to the stage cost more
    const rowMultiplier = 1 + (Math.max(row, 1) - 1) * 0.05;
    price *= rowMultiplier;

    return Math.round(price * 100) / 100;
  }

  async getSeatMap(eventId: string) {
    await this.freeExpiredHolds(eventId);
    const seats = await this.prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ section: 'asc' }, { row: 'asc' }, { seatNumber: 'asc' }],
    });

    const grouped = seats.reduce((acc, seat) => {
      if (!acc[seat.section]) {
        acc[seat.section] = [];
      }
      // heldBy is internal; the client only needs to know a seat is unavailable
      const { heldBy, heldUntil, ...publicSeat } = seat;
      acc[seat.section].push(publicSeat);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      eventId,
      sections: Object.keys(grouped).map((section) => ({
        name: section,
        seats: grouped[section],
      })),
    };
  }

  async getAvailableSeats(eventId: string) {
    await this.freeExpiredHolds(eventId);
    return this.prisma.seat.findMany({
      where: { eventId, isAvailable: true, isHeld: false },
    });
  }
}
