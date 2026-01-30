import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION, ROL_MASTER } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { schoolTable, usersTable } from '../db/schema';
import { eq, ilike, sql, and, asc } from 'drizzle-orm';
import { PaginationSchoolsDto } from './dto/pagination-schools.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class ShoolsService {

    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async getAll() {
      try{
        const result = await this.db.select({
            id: schoolTable.id, 
            name: schoolTable.name, 
            slug: schoolTable.slug 
        }).from(schoolTable);
    
        return result || null;
        
      }catch(err){
        console.error("Error en la base de datos al buscar las escuelas: ", err);
        throw new Error("Error al obtener las escuelas " + err);
      }
    }
    
async getById(id: number) {
    try {
      const result = await this.db
        .select({
          id: schoolTable.id,
          name: schoolTable.name,
          address: schoolTable.address,
          base_score: schoolTable.base_score,
          is_active: schoolTable.is_active,
        })
        .from(schoolTable)
        .where(eq(schoolTable.id, id));

      // Validación dentro del servicio
      if (!result[0]) {
        throw new NotFoundException(`La escuela con ID ${id} no fue encontrada`);
      }

      return result[0];

    } catch (err) {
      // Si ya es un error de Nest (como el NotFound), lo relanzamos
      if (err instanceof NotFoundException) throw err;

      // Error genérico de base de datos
      console.error(`Error en la base de datos al buscar la escuela ${id}: `, err);
      throw new InternalServerErrorException(`Error al obtener la escuela ${id}: ${err.message}`);
    }
  }

/**
   * Genera un slug amigable para URLs
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD') // Descompone caracteres con tildes
      .replaceAll(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (tildes)
      .replaceAll(/[^a-z0-9\s-]/g, '')    // Elimina caracteres que no sean letras, números o espacios
      .replaceAll(/\s+/g, '-')            // Convierte espacios en guiones
      .replaceAll(/-+/g, '-');            // Evita guiones múltiples seguidos
  }

  async create(dto: CreateSchoolDto & { logo_url?: string }) {
    try {
      // 1. Generamos el slug usando la lógica de replaceAll (SonarQube)
      const slug = this.generateSlug(dto.name);

      // 2. Insertamos en la base de datos
      const [newSchool] = await this.db
        .insert(schoolTable)
        .values({
          name: dto.name,
          slug: slug,
          address: dto.address,
          base_score: dto.base_score ?? 0,
          logo_url: dto.logo_url ?? null, // Nueva columna opcional
          is_active: true,                // Por defecto habilitada
          created_at: new Date(),         // Fecha de creación
          updated_at: new Date(),         // Fecha de actualización
        } as any)
        .returning();

      return newSchool;
    } catch (error) {
      // Error de llave duplicada en Postgres (nombre o slug)
      if (error.code === '23505') {
        throw new ConflictException('Ya existe una escuela con ese nombre.');
      }
      
      console.error("Error al crear escuela:", error);
      throw new InternalServerErrorException('No se pudo crear la escuela en la base de datos.');
    }
  }

async findAllPaginated(payload: PaginationSchoolsDto) {
    const { page, limit, search } = payload;
    const offset = (page - 1) * limit;

    try {
      // 1. Condición de búsqueda por el slug
      const whereCondition = search ? ilike(schoolTable.slug, `%${search}%`) : undefined;

      // 2. Consulta principal con agregación de Masters y Ordenamiento
      const schools = await this.db
        .select({
          id: schoolTable.id,
          name: schoolTable.name,
          slug: schoolTable.slug,
          address: schoolTable.address,
          base_score: schoolTable.base_score,
          logo_url: schoolTable.logo_url,
          is_active: schoolTable.is_active,
          masters: sql`json_agg(
            json_build_object(
              'id', ${usersTable.id},
              'fullname', concat(${usersTable.name}, ' ', ${usersTable.lastname}),
              'email', ${usersTable.email}
            )
          ) filter (where ${usersTable.id} is not null)`
        })
        .from(schoolTable)
        .leftJoin(usersTable, and(
          eq(schoolTable.id, usersTable.school_id),
          sql`${usersTable.roles_ids} @> ${JSON.stringify([ROL_MASTER])}::jsonb`
        ))
        .where(whereCondition)
        .groupBy(schoolTable.id)
        .orderBy(asc(schoolTable.id)) // <--- SOLUCIÓN AL BUG: Orden fijo para paginación
        .limit(limit)
        .offset(offset);

      // 3. Conteo total para meta-data
      const [totalCount] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schoolTable)
        .where(whereCondition);

      const total = Number(totalCount.count);

      return {
        data: schools.map(s => ({ 
          ...s, 
          masters: (s.masters as any) || [] 
        })),
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        }
      };
    } catch (error) {
      console.error("Error Schools Service:", error);
      throw new InternalServerErrorException("No se pudo obtener el listado de escuelas.");
    }
  }

async update(id: number, dto: UpdateSchoolDto & { logo_url?: string }) {
  try {
    // 1. Preparamos el objeto de actualización con la fecha actual
    const updateData: any = { 
      ...dto, 
      updated_at: new Date()  
    };

    // 2. Si el nombre cambió, generamos un nuevo slug (cumpliendo replaceAll de SonarQube)
    if (dto.name) {
      updateData.slug = this.generateSlug(dto.name);
    }

    // 3. Ejecutamos la actualización en la DB
    const [updatedSchool] = await this.db
      .update(schoolTable)
      .set(updateData)
      .where(eq(schoolTable.id, id))
      .returning();

    // 4. Si no devuelve nada, la escuela no existe
    if (!updatedSchool) {
      throw new NotFoundException(`No se encontró la escuela con ID ${id}`);
    }

    return updatedSchool;
  } catch (error) {
    if (error instanceof NotFoundException) throw error;
    
    // Error de duplicados en Postgres
    if (error.code === '23505') {
      throw new ConflictException('El nuevo nombre de la escuela ya está en uso.');
    }
    
    console.error('ERROR_UPDATE_SCHOOL:', error);
    throw new InternalServerErrorException('Error al actualizar la escuela.');
  }
}

// 1. ELIMINAR REGISTRO (Borrado físico)
  async remove(id: number) {
    try {
      const [deletedSchool] = await this.db
        .delete(schoolTable)
        .where(eq(schoolTable.id, id))
        .returning();

      if (!deletedSchool) {
        throw new NotFoundException(`No se encontró la escuela con ID ${id} para eliminar.`);
      }

      return { message: 'Escuela eliminada permanentemente.', data: deletedSchool };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al eliminar la escuela de la base de datos.');
    }
  }

  // 2. HABILITAR / INHABILITAR (Cambio de estado)
  async changeStatus(id: number, isActive: boolean) {
    try {
      const [updatedSchool] = await this.db
        .update(schoolTable)
        .set({ is_active: isActive } as any)
        .where(eq(schoolTable.id, id))
        .returning();

      if (!updatedSchool) {
        throw new NotFoundException(`No se encontró la escuela con ID ${id}.`);
      }

      const statusMsg = isActive ? 'habilitada' : 'inhabilitada';
      return { message: `Escuela ${statusMsg} correctamente.`, data: updatedSchool };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al cambiar el estado de la escuela.');
    }
  }
}