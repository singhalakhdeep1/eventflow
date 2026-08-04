import { Module } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SeatMapService],
  exports: [SeatMapService],
})
export class SeatMapModule {}
