import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { schoolTable } from '../db/schema';

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
    
        return result[0] || null;
        
      }catch(err){
        console.error("Error en la base de datos al buscar las escuelas: ", err);
        throw new Error("Error al obtener las escuelas " + err);
      }
    }
    
}