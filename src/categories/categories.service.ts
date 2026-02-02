import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { karateBeltsTable, karateCategoriesTable } from '../db/schema';
import { eq, ilike, asc, sql, inArray } from 'drizzle-orm';
import { PaginationCategoriesDto } from './dto/pagination-categories.dto';

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

async findAllPaginated(payload: PaginationCategoriesDto) {
  const { page, limit, search } = payload;
  const offset = (page - 1) * limit;

  try {
    const whereCondition = search 
      ? ilike(karateCategoriesTable.category, `%${search}%`) 
      : undefined;

    // 1. Obtener las categorías paginadas
    const categories = await this.db
      .select()
      .from(karateCategoriesTable)
      .where(whereCondition)
      .orderBy(asc(karateCategoriesTable.id))
      .limit(limit)
      .offset(offset);

    // 2. Resolver los nombres de los cinturones
    // Extraemos todos los IDs únicos de cinturones mencionados en las categorías actuales
    const allBeltIds = [...new Set(categories.flatMap(c => c.allowed_belts || []))];

    let beltsMap = new Map();
    if (allBeltIds.length > 0) {
      const beltsData = await this.db
        .select()
        .from(karateBeltsTable)
        .where(inArray(karateBeltsTable.id, allBeltIds));
      
      // Creamos un mapa para búsqueda rápida [id -> {nombre, color, grado}]
      beltsData.forEach(b => beltsMap.set(b.id, b));
    }

    // 3. Mapear los resultados para incluir el objeto completo del cinturón
    const dataWithBelts = categories.map(cat => ({
      ...cat,
      allowed_belts_details: (cat.allowed_belts || []).map(id => beltsMap.get(id)).filter(Boolean)
    }));

    // 4. Conteo total
    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(karateCategoriesTable)
      .where(whereCondition);

    const total = Number(totalCount.count);

    return {
      data: dataWithBelts,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException('Error al obtener categorías con detalles de cinturones');
  }
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
    const [deletedCategory] = await this.db.delete(karateCategoriesTable)
        .where(eq(karateCategoriesTable.id, id))
        .returning();

    // Validación: Si deletedCategory es undefined, el ID no existía
    if (!deletedCategory) {
      throw new NotFoundException(`No se encontró la categoría con el ID ${id}`);
    }

    return {
      message: 'Categoría eliminada exitosamente',
      data: deletedCategory,
    }
  }

}