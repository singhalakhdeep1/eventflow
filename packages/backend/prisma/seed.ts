import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EventFlow database...');

  await prisma.event.create({
    data: {
      title: 'Neon Nights Music & Art Festival 2026',
      venue: 'Metropolitan Arena, New York',
      eventDate: new Date('2026-11-15'),
      totalTickets: 12000,
    },
  });

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
