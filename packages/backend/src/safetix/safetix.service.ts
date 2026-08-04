import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SafeTixService {
  constructor(private prisma: PrismaService) {}

  async verifyTicket(ticketId: string, deviceId: string, ipAddress: string, location: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'VALID') {
      throw new Error('Ticket is not valid');
    }

    // Check for existing security record
    const existing = await this.prisma.ticketSecurity.findUnique({
      where: { ticketId },
    });

    let riskScore = 0;
    let isFlagged = false;

    if (existing) {
      // Check for device/IP mismatch
      if (existing.deviceId !== deviceId) riskScore += 30;
      if (existing.ipAddress !== ipAddress) riskScore += 20;

      // Check for unusual location
      if (this.calculateDistance(existing.location, location) > 10) {
        riskScore += 40;
      }

      // Check for rapid reuse
      const timeSinceLastUse = Date.now() - existing.lastUsedAt.getTime();
      if (timeSinceLastUse < 60000) riskScore += 50; // Less than 1 minute
    }

    isFlagged = riskScore >= 50;

    const security = await this.prisma.ticketSecurity.upsert({
      where: { ticketId },
      create: {
        ticketId,
        deviceId,
        ipAddress,
        location,
        verifiedAt: new Date(),
        lastUsedAt: new Date(),
        riskScore,
        isFlagged,
      },
      update: {
        deviceId,
        ipAddress,
        location,
        lastUsedAt: new Date(),
        riskScore,
        isFlagged,
      },
    });

    return {
      valid: true,
      riskScore,
      isFlagged,
      securityId: security.id,
    };
  }

  private calculateDistance(loc1: any, loc2: any): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.lat)) *
        Math.cos(this.toRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async flagTicket(ticketId: string, reason: string) {
    return this.prisma.ticketSecurity.update({
      where: { ticketId },
      data: {
        isFlagged: true,
        riskScore: 100,
      },
    });
  }

  async getSecurityReport(ticketId: string) {
    return this.prisma.ticketSecurity.findUnique({
      where: { ticketId },
    });
  }

  async getFlaggedTickets() {
    return this.prisma.ticketSecurity.findMany({
      where: { isFlagged: true },
      include: { ticket: true },
    });
  }
}
