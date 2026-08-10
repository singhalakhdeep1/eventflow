import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimedEntryService {
  constructor(private prisma: PrismaService) {}

  async validateTimedEntry(ticketId: string) {
    return { ticketId, status: 'ready' };
  }

  async configureTimedEntry(eventId: string, body: any) {
    return { eventId, windowMinutes: body.windowMinutes ?? 30 };
  }

  async getEntryStatus(ticketId: string) {
    return { ticketId, status: 'checked-in' };
  }

  async grantEntry(ticketId: string) {
    return { ticketId, status: 'granted' };
  }

  async createTimeSlot(eventId: string, startTime: Date, endTime: Date, capacity: number) {
    return this.prisma.timeSlot.create({
      data: {
        eventId,
        startTime,
        endTime,
        capacity,
        bookedCount: 0,
      },
    });
  }

  async getTimeSlots(eventId: string) {
    return this.prisma.timeSlot.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
    });
  }

  async bookTimeSlot(ticketId: string, timeSlotId: string) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      throw new BadRequestException('Time slot not found');
    }

    if (timeSlot.bookedCount >= timeSlot.capacity) {
      throw new BadRequestException('Time slot is full');
    }

    await this.prisma.$transaction([
      this.prisma.ticketTimeSlot.create({
        data: {
          ticketId,
          timeSlotId,
        },
      }),
      this.prisma.timeSlot.update({
        where: { id: timeSlotId },
        data: {
          bookedCount: { increment: 1 },
        },
      }),
    ]);

    return { success: true };
  }

  async checkIn(ticketId: string) {
    const ticketSlot = await this.prisma.ticketTimeSlot.findUnique({
      where: { ticketId },
      include: { timeSlot: true },
    });

    if (!ticketSlot) {
      throw new BadRequestException('No time slot assigned to ticket');
    }

    const now = new Date();
    const timeSlot = ticketSlot.timeSlot;

    if (now < timeSlot.startTime) {
      throw new BadRequestException('Too early to check in');
    }

    if (now > timeSlot.endTime) {
      throw new BadRequestException('Time slot has expired');
    }

    return this.prisma.ticketTimeSlot.update({
      where: { id: ticketSlot.id },
      data: { checkedInAt: now },
    });
  }

  async checkOut(ticketId: string) {
    return this.prisma.ticketTimeSlot.update({
      where: { ticketId },
      data: { checkedOutAt: new Date() },
    });
  }

  async getTicketTimeSlot(ticketId: string) {
    return this.prisma.ticketTimeSlot.findUnique({
      where: { ticketId },
      include: { timeSlot: true },
    });
  }
}
