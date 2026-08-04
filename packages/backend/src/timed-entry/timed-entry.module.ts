import { Module } from '@nestjs/common';
import { TimedEntryService } from './timed-entry.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TimedEntryService],
  exports: [TimedEntryService],
})
export class TimedEntryModule {}
