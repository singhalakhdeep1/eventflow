import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { SeatsModule } from './seats/seats.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { CheckinModule } from './checkin/checkin.module';
import { TimedEntryModule } from './timed-entry/timed-entry.module';
import { SeatMapModule } from './seat-map/seat-map.module';
import { PayoutsModule } from './payouts/payouts.module';
import { SafeTixModule } from './safetix/safetix.module';
import { AICopyModule } from './ai-copy/ai-copy.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    SeatsModule,
    TicketsModule,
    PaymentsModule,
    CheckinModule,
    TimedEntryModule,
    SeatMapModule,
    PayoutsModule,
    SafeTixModule,
    AICopyModule,
  ],
})
export class AppModule {}
