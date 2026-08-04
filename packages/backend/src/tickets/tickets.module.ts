import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { SeatsModule } from '../seats/seats.module';
import { PaymentsModule } from '../payments/payments.module';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [PrismaModule, UsersModule, EventsModule, SeatsModule, PaymentsModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
