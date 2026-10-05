import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() dto: CreateEventDto) {
    if (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only organizers can create events');
    }
    return this.eventsService.create({
      ...dto,
      availableSeats: dto.totalSeats,
      organizerId: req.user.id,
    });
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.eventsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto, req.user);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Request() req, @Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.eventsService.updateStatus(id, body.status, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.eventsService.delete(id, req.user);
  }
}
