import { Module } from '@nestjs/common';
import { TimedEntryService } from './timed-entry.service';
import { TimedEntryController } from './timed-entry.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimedEntryController],
  providers: [TimedEntryService],
  exports: [TimedEntryService],
})
export class TimedEntryModule {}
