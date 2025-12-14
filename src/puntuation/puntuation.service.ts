import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { usersTable } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import {ROL_ALUMNO} from '../constants';
import { ShoolsService } from '../shools/shools.service';

@Injectable()
export class PuntuationService {
    constructor(@Inject(PG_CONNECTION) private db: NeonDatabase , private readonly shoolsService: ShoolsService) {}

    async getAthletesBySchool(school_id: number) { //lista los alumnos de una escuela
        const school = await this.shoolsService.getById(school_id);
        if(!school){
            throw new Error("La escuela con id " + school_id + " no existe");
        }

        try{
        const schoolCondition = eq(usersTable.school_id, school_id);
        const roleCondition = sql`${usersTable.roles_ids} @> ${sql.raw(`'[${ROL_ALUMNO}]'`)}`;

        const result = await this.db.select({
            id: usersTable.id,
            name: usersTable.name,
            lastname: usersTable.lastname,
            email: usersTable.email,
            // roles_ids: usersTable.roles_ids,
        }).from(usersTable)
        .where(and(schoolCondition, roleCondition));
    
        return result || null;
        
        }catch(err){
        console.error("Error en la base de datos al buscar los atletas de la escuela: ", err);
        throw new Error("Error al obtener los atletas de la escuela " + err);
        }
    }
    
}
