import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from './constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { roleTable, usersTable } from './db/schema';
import { eq } from 'drizzle-orm'

@Injectable()
export class AppService {

//  constructor(@Inject(PG_CONNECTION) private conn: NeonDatabase) {
//   console.log("******** Coneccion BD:  ", this.conn);
//  }
constructor(){}

  async getUsers() {
    try{
/*       const result = await this.conn
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: roleTable.name,
      })
      .from(usersTable)
      .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) ) */
      const result = [
        {
    "email": "katherine.revenga@gmail.com",
    "password": "12345678",
    "roles_id": 1
    }
      ]
  
      return result; 

    }catch(err){

      console.error("Error al obtener usuarios:", err);
      throw new Error("Error al obtener usuarios");
    }

  }
}