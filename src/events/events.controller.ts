import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, ParseIntPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginationEventsDto } from './dto/pagination-events.dto';
import { ChangeStatusEventDto } from './dto/change-status-event.dto';
import { Public } from '../decorators/public.decorator';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';

@Controller('events')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // @Public()
  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Usersesion() user: IJwtPayload // <-- Capturamos al usuario en sesión
  ) {
    return this.eventsService.create(createEventDto, user.sub);
  }

  @Public()
  @Get()
  async findAll(@Query() query: PaginationEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { // NestJS valida y transforma aquí
    return this.eventsService.findOne(id);
  }

  @Public()
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto
  ) {console.log( "parametros recibidos: ", id, updateEventDto)
    // El signo + convierte el string a number explícitamente si es necesario
    return this.eventsService.update(+id, updateEventDto);
  }

  @Public()
  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusEventDto,
  ) {
    return this.eventsService.changeStatus(id, changeStatusDto.status_id);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.disable(+id);
  }

  // CALENDARIO:
  @Public()
  @Get('calendar/view')
  async getCalendar(
    @Query('year', ParseIntPipe) year: number,
    @Query('month') month?: string, // Lo recibimos opcional
  ) {
    // Solo parseamos el mes si viene en la URL
    const parsedMonth = month ?  Number.parseInt(month, 10) : undefined;
    
    return this.eventsService.getEventsForCalendar(year, parsedMonth);
  }
}