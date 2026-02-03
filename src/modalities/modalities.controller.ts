import { Controller, Get, Post, Body, UsePipes, ValidationPipe, Delete, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ModalitiesService } from './modalities.service';
import { CreateModalityDto } from './dto/create-modality.dto';
import { Public } from '../decorators/public.decorator';
import { PaginationModalitiesDto } from './dto/pagination-modalities.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';

@Controller('modalities')
export class ModalitiesController {
  constructor(private readonly modalitiesService: ModalitiesService) {}

  @Public()
  @Post()
  create(@Body() createModalityDto: CreateModalityDto) {
    return this.modalitiesService.create(createModalityDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.modalitiesService.findAll();
  }

/* URL: POST http://localhost:3000/modalities/list
  Body: {
  "page": 1,
  "limit": 10,
  "search": "Individual",
  "type": "kata"
} */
  @Public()
  @Post('list')
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    transformOptions: { enableImplicitConversion: true } 
  }))
  async findAllPaginated(@Body() paginationDto: PaginationModalitiesDto) {
    return this.modalitiesService.findAllPaginated(paginationDto);
  }

  /*
  URL: PATCH http://localhost:3000/modalities/5 (donde 5 es el ID)
  body:
  {
    "name": "Modalidad Actualizada",
    "type": "kata",
    "style": "individual",
    "description": "Descripción actualizada de la modalidad"
  }
    o solo:
    {
      "description": "Nueva descripción detallada para la modalidad de Kata Individual."
    }
  */
  @Public()
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModalityDto: UpdateModalityDto,
  ) {
    return await this.modalitiesService.update(id, updateModalityDto);
  }

  /**
   * DELETE
   * @URL http://localhost:3000/modalities/5  (donde 5 es el ID que quieres borrar)
   */
  @Public()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.modalitiesService.remove(id);
  }
}