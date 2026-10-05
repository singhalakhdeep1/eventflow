import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EventFlow database...');

  // Never ship a known password: set SEED_ADMIN_PASSWORD or a random one is generated and printed.
  const password = process.env.SEED_ADMIN_PASSWORD || require('crypto').randomBytes(12).toString('base64url');
  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventflow.local' },
    update: {},
    create: {
      email: 'organizer@eventflow.local',
      password: await bcrypt.hash(password, 12),
      firstName: 'Demo',
      lastName: 'Organizer',
      role: 'ORGANIZER',
    },
  });
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`Seed organizer password (generated): ${password}`);
  }

  const existing = await prisma.event.findFirst({ where: { organizerId: organizer.id } });
  if (!existing) {
    const event = await prisma.event.create({
      data: {
        name: 'Neon Nights Music & Art Festival 2026',
        description: 'A three-day festival of live music and immersive art.',
        venueName: 'Metropolitan Arena',
        venueAddress: 'New York, NY',
        startDate: new Date('2026-11-15T18:00:00Z'),
        endDate: new Date('2026-11-17T23:00:00Z'),
        category: 'Music',
        status: 'PUBLISHED',
        organizerId: organizer.id,
        totalSeats: 20,
        availableSeats: 20,
        basePrice: 79,
      },
    });

    await prisma.seat.createMany({
      data: Array.from({ length: 20 }, (_, i) => ({
        eventId: event.id,
        section: 'A',
        row: String(Math.floor(i / 10) + 1),
        seatNumber: String((i % 10) + 1),
        price: 79,
      })),
    });
  }

  console.log('Seeding complete for EventFlow.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
