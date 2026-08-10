import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';

@Controller('seat-map')
export class SeatMapController {
  constructor(private readonly seatMapService: SeatMapService) {}

  @Get('event/:eventId')
  async getSeatMap(@Param('eventId') eventId: string) {
    return this.seatMapService.getSeatMap(eventId);
  }

  @Post('hold')
  async holdSeats(@Body() body: { eventId: string; seatIds: string[]; userId: string }) {
    return this.seatMapService.holdSeats(body.eventId, body.seatIds, body.userId);
  }

  @Post('release')
  async releaseSeats(@Body() body: { seatIds: string[]; userId: string }) {
    return this.seatMapService.releaseSeats(body.seatIds, body.userId);
  }

  @Post('configure/:eventId')
  async configureSeatMap(@Param('eventId') eventId: string, @Body() body: any) {
    return this.seatMapService.configureSeatMap(eventId, body);
  }
}
