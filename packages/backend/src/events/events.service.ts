import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.event.create({
      data,
      include: { organizer: true },
    });
  }

  async findAll(filters: any = {}) {
    return this.prisma.event.findMany({
      where: {
        ...(filters.organizerId && { organizerId: filters.organizerId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
      },
      include: {
        organizer: true,
        _count: {
          select: { seats: true },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        seats: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, data: any) {
    return this.prisma.event.update({
      where: { id },
      data,
      include: { organizer: true },
    });
  }

  async delete(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.event.update({
      where: { id },
      data: { status },
    });
  }
}
