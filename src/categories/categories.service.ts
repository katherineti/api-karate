import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { karateCategoriesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategoriesService {

  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}
  
// Crear una nueva categoría en el catálogo global
async create(dto: CreateCategoryDto) {
  try {
    const values = {
        category: dto.category.trim(), // Limpiamos espacios
        age_range: dto.age_range.trim(),
        allowed_belts: dto.allowed_belts || [],
      }
    const [newCategory] = await this.db.insert(karateCategoriesTable)
      .values(values)
      .returning();
    return newCategory;
  } catch (error) {
    if (error.code === '23505') {
      // Extraemos el detalle de la base de datos (Postgres nos dice qué campo falló)
      const detail = error.detail; 
      if (detail.includes('category')) {
        throw new ConflictException(`El nombre "${dto.category}" ya está registrado.`);
      }
      if (detail.includes('age_range')) {
        throw new ConflictException(`El rango de edad "${dto.age_range}" ya está asignado a otra categoría.`);
      }
      throw new ConflictException('Ya existe una categoría con estos datos.');
    }
    throw error;
  }
}

  // Listar todo el catálogo para selectores en el frontend
  async findAll() {
    return this.db.select().from(karateCategoriesTable);
  }


  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

 async update(dto: UpdateCategoryDto) {
    const { id, ...updateData } = dto;

    try {
      const [updatedCategory] = await this.db
        .update(karateCategoriesTable)
        .set({
          ...updateData,
          // Si allowed_belts viene en el DTO, se actualiza el array en Postgres
        })
        .where(eq(karateCategoriesTable.id, id))
        .returning();

      if (!updatedCategory) {
        throw new NotFoundException(`La categoría con ID ${id} no existe.`);
      }

      return updatedCategory;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Los nuevos datos (nombre o rango) ya están en uso por otra categoría.');
      }
      throw error;
    }
  }

  // Eliminar una categoría (solo si no está siendo usada en un evento)
  async remove(id: number) {
    return this.db.delete(karateCategoriesTable)
      .where(eq(karateCategoriesTable.id, id))
      .returning();
  }

}