import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  // @Roles(RoleType.Admin) // Solo el Admin debería expandir el catálogo global
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get() //reservado para mostrar todas las categorias en el dashboard
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Delete(':id')//sin usar
  // @Roles(RoleType.Admin)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }

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