import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('seats')
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() seatData: any) {
    return this.seatsService.create(seatData);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.seatsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seatsService.findById(id);
  }

  @Post(':id/book')
  @UseGuards(JwtAuthGuard)
  bookSeat(@Param('id') id: string, @Request() req) {
    return this.seatsService.bookSeat(id, req.user.id);
  }

  @Post(':id/release')
  @UseGuards(JwtAuthGuard)
  releaseSeat(@Param('id') id: string) {
    return this.seatsService.releaseSeat(id);
  }

  @Get('event/:eventId/available')
  getAvailableSeats(@Param('eventId') eventId: string) {
    return this.seatsService.getAvailableSeats(eventId);
  }
}
