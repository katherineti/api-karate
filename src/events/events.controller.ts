import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, ParseIntPipe, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PaginationEventsDto } from './dto/pagination-events.dto';
import { ChangeStatusEventDto } from './dto/change-status-event.dto';
import { Public } from '../decorators/public.decorator';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('events')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // @Public()
                                 //Bueno - antes de la amges
/*   @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Usersesion() user: IJwtPayload // <-- Capturamos al usuario en sesión
  ) {
    return this.eventsService.create(createEventDto, user.sub);
  } */
@Post()
// 👇 ESTO ES LO QUE TE FALTA: Activa la transformación de tipos para este endpoint
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    forbidNonWhitelisted: true 
  }))
@UseInterceptors(FileFieldsInterceptor([
  { name: 'poster_front', maxCount: 1 },
  { name: 'poster_back', maxCount: 1 },
], {
  storage: diskStorage({
    destination: './uploads/events',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
}))
async create(
  @Body() createEventDto: CreateEventDto,
  @Usersesion() user: IJwtPayload,
  @UploadedFiles() files: { poster_front?: Express.Multer.File[], poster_back?: Express.Multer.File[] }
) {
  // Extraemos las rutas de los archivos si existen
  if (files.poster_front) {
    createEventDto.poster_front_url = `/uploads/events/${files.poster_front[0].filename}`;
  }
  if (files.poster_back) {
    createEventDto.poster_back_url = `/uploads/events/${files.poster_back[0].filename}`;
  }

  return this.eventsService.createNvo(createEventDto, user.sub);
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

  //update bueno - sin imagenes
/*   @Public()
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto
  ) {console.log( "parametros recibidos: ", id, updateEventDto)
    // El signo + convierte el string a number explícitamente si es necesario
    return this.eventsService.update(+id, updateEventDto);
  } */

    //actualizar evento con afiche
@Public()
@Patch(':id')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'poster_front', maxCount: 1 },
  { name: 'poster_back', maxCount: 1 },
], {
  storage: diskStorage({
    destination: './uploads/events',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
}))
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateEventDto: UpdateEventDto,
  @UploadedFiles() files: { poster_front?: Express.Multer.File[], poster_back?: Express.Multer.File[] }
) {
  // Si el usuario subió fotos nuevas, añadimos las rutas al DTO
  if (files?.poster_front) {
    updateEventDto.poster_front_url = `/uploads/events/${files.poster_front[0].filename}`;
  }
  if (files?.poster_back) {
    updateEventDto.poster_back_url = `/uploads/events/${files.poster_back[0].filename}`;
  }

  return this.eventsService.update(id, updateEventDto);
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