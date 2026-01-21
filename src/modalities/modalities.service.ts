import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateModalityDto } from './dto/create-modality.dto';
import { UpdateModalityDto } from './dto/update-modality.dto';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { modalitiesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

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

      // Insertar usando el DTO
      const result = await this.db
        .insert(modalitiesTable)
        .values({
          name: dto.name,
          type: dto.type,
        })
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

}