import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventStatus } from '@prisma/client';
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
        startDate: 'asc',
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

  async update(id: string, data: any, actor?: { id: string; role: string }) {
    if (actor) await this.assertCanManage(id, actor);
    return this.prisma.event.update({
      where: { id },
      data,
      include: { organizer: true },
    });
  }

  async delete(id: string, actor?: { id: string; role: string }) {
    if (actor) await this.assertCanManage(id, actor);
    return this.prisma.event.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string, actor?: { id: string; role: string }) {
    if (!Object.values(EventStatus).includes(status as EventStatus)) {
      throw new BadRequestException(`Invalid status. Allowed: ${Object.values(EventStatus).join(', ')}`);
    }
    if (actor) await this.assertCanManage(id, actor);
    return this.prisma.event.update({
      where: { id },
      data: { status: status as EventStatus },
    });
  }

  private async assertCanManage(id: string, actor: { id: string; role: string }) {
    const event = await this.prisma.event.findUnique({ where: { id }, select: { organizerId: true } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (actor.role !== 'ADMIN' && event.organizerId !== actor.id) {
      throw new ForbiddenException('You can only manage your own events');
    }
  }
}
