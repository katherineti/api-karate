import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginationEventsDto } from './dto/pagination-events.dto';
import { ChangeStatusEventDto } from './dto/change-status-event.dto';

@Controller('events')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  async findAll(@Query() query: PaginationEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { // NestJS valida y transforma aquí
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto
  ) {console.log( "parametros recibidos: ", id, updateEventDto)
    // El signo + convierte el string a number explícitamente si es necesario
    return this.eventsService.update(+id, updateEventDto);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusEventDto,
  ) {
    return this.eventsService.changeStatus(id, changeStatusDto.status_id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.disable(+id);
  }
}