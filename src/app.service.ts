import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { usersTable } from './db/schema';

@Injectable()
export class AppService {

  constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) {
  //  console.log("desde AppService - Coneccion BD:  ", this.conn);
  }
// constructor(){}

  async getUsers(): Promise<any[]> {
    try{
       const result = await this.conn
      .select({
        id: usersTable.id,
        email: usersTable.email,
        // role: roleTable.name,
        roles_ids: usersTable.roles_ids,
      })
      .from(usersTable)
      // .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) ) 
  
      return result; 

    }catch(err){

      console.error("Error al obtener usuarios:", err);
      throw new Error("Error al obtener usuarios");
    }

  }
}