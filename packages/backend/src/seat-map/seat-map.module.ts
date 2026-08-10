import { Module } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';
import { SeatMapController } from './seat-map.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeatMapController],
  providers: [SeatMapService],
  exports: [SeatMapService],
})
export class SeatMapModule {}
