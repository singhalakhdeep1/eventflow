import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { SeatMapService } from './seat-map.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('seat-map')
export class SeatMapController {
  constructor(private readonly seatMapService: SeatMapService) {}

  @Get('event/:eventId')
  async getSeatMap(@Param('eventId') eventId: string) {
    return this.seatMapService.getSeatMap(eventId);
  }

  @Post('hold')
  @UseGuards(JwtAuthGuard)
  async holdSeats(@Request() req, @Body() body: { eventId: string; seatIds: string[] }) {
    return this.seatMapService.holdSeats(body.eventId, body.seatIds, req.user.id);
  }

  @Post('release')
  @UseGuards(JwtAuthGuard)
  async releaseSeats(@Request() req, @Body() body: { seatIds: string[] }) {
    return this.seatMapService.releaseSeats(body.seatIds, req.user.id);
  }

  @Post('configure/:eventId')
  @UseGuards(JwtAuthGuard)
  async configureSeatMap(@Request() req, @Param('eventId') eventId: string, @Body() body: any) {
    return this.seatMapService.configureSeatMap(eventId, body, req.user);
  }
}
