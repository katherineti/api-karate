import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateKarateBeltDto } from './dto/create-karate-belt.dto';
import { UpdateKarateBeltDto } from './dto/update-karate-belt.dto';
import { karateBeltsTable } from '../db/schema';
import { asc, eq, ilike, sql } from 'drizzle-orm';
import { PaginationKarateBeltsDto } from './dto/pagination-karate-belts.dto';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

@Injectable()
export class KarateBeltsService {
      constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}
  
async findAllPaginated(payload: PaginationKarateBeltsDto) {
    const { page, limit, search } = payload;
    const offset = (page - 1) * limit;

    try {
      const whereCondition = search ? ilike(karateBeltsTable.belt, `%${search}%`) : undefined;

      // 1. Consulta de datos
      const belts = await this.db
        .select()
        .from(karateBeltsTable)
        .where(whereCondition)
        .orderBy(asc(karateBeltsTable.id)) // Orden fijo para evitar duplicados en paginación
        .limit(limit)
        .offset(offset);

      // 2. Conteo total para meta-información
      const [totalCount] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(karateBeltsTable)
        .where(whereCondition);

      const total = Number(totalCount.count);

      return {
        data: belts,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      console.error("Error Karate Belts Service:", error);
      throw new InternalServerErrorException("No se pudo obtener el listado de cinturones.");
    }
  }

async remove(id: number) {
    try {
      // Intentamos eliminar y capturamos el registro borrado
      const [deletedBelt] = await this.db
        .delete(karateBeltsTable)
        .where(eq(karateBeltsTable.id, id))
        .returning();

      // Si no hay registro devuelto, es que el ID no existía
      if (!deletedBelt) {
        throw new NotFoundException(`No se encontró el cinturón con ID ${id} para eliminar.`);
      }

      return {
        message: 'Cinturón eliminado exitosamente.',
        data: deletedBelt,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      // Manejo de error de clave foránea (si el cinturón ya está asignado a alumnos)
      if (error.code === '23503') {
        throw new ConflictException(
          'No se puede eliminar el cinturón porque hay alumnos asociados a él.'
        );
      }

      console.error(error);
      throw new InternalServerErrorException('Error al eliminar el cinturón de la base de datos.');
    }
  }
}
