import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateKarateBeltDto } from './dto/create-karate-belt.dto';
import { UpdateKarateBeltDto } from './dto/update-karate-belt.dto';
import { karateBeltsTable } from '../db/schema';
import { asc, ilike, sql } from 'drizzle-orm';
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


}
