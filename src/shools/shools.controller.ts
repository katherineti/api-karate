import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ShoolsService } from './shools.service';
import { PaginationSchoolsDto } from './dto/pagination-schools.dto';
import { Public } from '../decorators/public.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ChangeStatusSchoolDto } from './dto/change-status-school.dto';

@Controller('shools')
export class ShoolsController {

    constructor(private readonly shoolsService: ShoolsService) {}
    
  @Get()//protegido
  // @UseGuards(AuthGuard)
  async getAll() {
  return this.shoolsService.getAll();
  }

  @Public()
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    // La validación ocurre dentro del servicio
    return await this.shoolsService.getById(id);
  }

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createSchoolDto: CreateSchoolDto) {
    // El servicio se encarga de generar el slug y guardar el puntaje base
    return this.shoolsService.create(createSchoolDto);
  }

    @Public()
    @Post('list') // Cambiamos a POST para recibir el Body
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async getSchools(@Body() paginationDto: PaginationSchoolsDto) {
        return this.shoolsService.findAllPaginated(paginationDto);
    }

  @Public()
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.shoolsService.update(id, updateSchoolDto);
  }

  // Endpoint para Habilitar/Inhabilitar (un solo controlador)
  @Public()
  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStatusDto: ChangeStatusSchoolDto,
  ) {
    return this.shoolsService.changeStatus(id, changeStatusDto.isActive);
  }

// Endpoint para Borrado Físico
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.shoolsService.remove(id);
  }

}