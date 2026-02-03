import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { modalitiesTable } from '../db/schema';
import { and, eq, ilike, sql, asc } from 'drizzle-orm';
import { PaginationModalitiesDto } from './dto/pagination-modalities.dto';

@Injectable()
export class ModalitiesService {

  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

async create(dto: CreateModalityDto) {
    try {
      // Validar duplicados por nombre
      const existing = await this.db
        .select()
        .from(modalitiesTable)
        .where(eq(modalitiesTable.name, dto.name))
        .limit(1);

      if (existing.length > 0) {
        throw new BadRequestException(`La modalidad '${dto.name}' ya existe.`);
      }

      const values = {
        name: dto.name,
        type: dto.type,
        style: dto.style || null,
        description: dto.description || null,
      }
      // Insertar usando el DTO
      const result = await this.db
        .insert(modalitiesTable)
        .values( values )
        .returning();

      return result[0];
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error al crear la modalidad: ' + error.message);
    }
  }

  async findAll() {
    return await this.db
      .select({
        id: modalitiesTable.id,
        name: modalitiesTable.name,
        type: modalitiesTable.type,
      })
      .from(modalitiesTable);
  }

async findAllPaginated(payload: PaginationModalitiesDto) {
  const { page, limit, search, type } = payload;
  const offset = (page - 1) * limit;

  try {
    // Construimos los filtros dinámicamente
    const filters = [];
    
    if (search) {
      filters.push(ilike(modalitiesTable.name, `%${search}%`));
    }
    
    if (type) {
      filters.push(ilike(modalitiesTable.type, `%${type}%`));
    }

    const whereCondition = filters.length > 0 ? and(...filters) : undefined;

    // 1. Obtener datos
    const modalities = await this.db
      .select()
      .from(modalitiesTable)
      .where(whereCondition)
      .orderBy(asc(modalitiesTable.id))
      .limit(limit)
      .offset(offset);

    // 2. Conteo total
    const [totalCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(modalitiesTable)
      .where(whereCondition);

    const total = Number(totalCount.count);

    return {
      data: modalities,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new InternalServerErrorException('Error al obtener modalidades paginadas');
  }

}

async update(id: number, dto: UpdateModalityDto) {
  try {
    // 1. Verificamos si hay algo que actualizar y limpiamos strings si es necesario
    const updateData = {
      ...(dto.name && { name: dto.name.trim() }),
      ...(dto.type && { type: dto.type.trim() }),
      ...(dto.style && { style: dto.style.trim() }),
      ...(dto.description && { description: dto.description.trim() }),
    };

    // 2. Ejecutamos la actualización
    const [updatedModality] = await this.db
      .update(modalitiesTable)
      .set(updateData)
      .where(eq(modalitiesTable.id, id))
      .returning();

    // 3. Si no existe el ID
    if (!updatedModality) {
      throw new NotFoundException(`La modalidad con ID ${id} no existe.`);
    }

    return {
      message: 'Modalidad actualizada correctamente',
      data: updatedModality,
    };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;

    // Manejo de duplicados (si intentas cambiar el nombre a uno que ya existe)
    if (error.code === '23505') {
      throw new ConflictException(`Ya existe otra modalidad con el nombre "${dto.name}".`);
    }

    throw new InternalServerErrorException('Error al actualizar la modalidad');
  }
}

async remove(id: number) {
  try {
    // Intentamos eliminar y capturamos el registro borrado
    const [deletedModality] = await this.db
      .delete(modalitiesTable)
      .where(eq(modalitiesTable.id, id))
      .returning();

    // Si no devuelve nada, el ID no existía
    if (!deletedModality) {
      throw new NotFoundException(`No se encontró la modalidad con ID ${id} para eliminar.`);
    }

    return {
      message: 'Modalidad eliminada exitosamente.',
      data: deletedModality,
    };
  } catch (error) {
    if (error instanceof NotFoundException) throw error;

    // Error 23503: Violación de llave foránea (si la modalidad está en uso)
    if (error.code === '23503') {
      throw new ConflictException(
        'No se puede eliminar la modalidad porque ya está asignada a categorías o eventos existentes.',
      );
    }

    throw new InternalServerErrorException('Error al eliminar la modalidad de la base de datos.');
  }
}

}