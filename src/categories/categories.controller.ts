import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../decorators/public.decorator';
import { PaginationCategoriesDto } from './dto/pagination-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Post()
  // @Roles(RoleType.Admin) // Solo el Admin debería expandir el catálogo global
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }
  
  @Public()
  @Get() //reservado para mostrar todas las categorias en el dashboard
  async findAll() {
    return this.categoriesService.findAll();
  }

/*
 lista paginada. URL: POST http://localhost:3000/categories/list
{
  "page": 1,
  "limit": 5,
  "search": "infantil"
}
*/
@Public()
@Post('list')
@UsePipes(new ValidationPipe({ 
  transform: true, 
  transformOptions: { enableImplicitConversion: true } 
}))
async findAllPaginated(@Body() paginationDto: PaginationCategoriesDto) {
  return this.categoriesService.findAllPaginated(paginationDto);
}

  @Public()
  @Delete(':id')//sin usar
  // @Roles(RoleType.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

  @Public()
  @Patch(':id')//se usara para la actualizacion de categorias, dentro del modulo eventos
  // @Roles(RoleType.Admin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto
  ) {
    // Aseguramos que el ID del parámetro sea el mismo que el del body
    return this.categoriesService.update({ ...dto, id });
  }
}