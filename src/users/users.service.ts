import { Inject, Injectable } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable } from 'src/db/schema';
import { eq } from 'drizzle-orm'
import * as argon2 from "argon2";
import { CreateUserDto } from './dto/create-user.dto';
import { SignupDto } from '../auth/signup.dto';

type User = {
    id: number;
    name: string;
    lastname: string;
    // age: number;
    email: string;
    password: string;
    created_at: Date;
    roles_id: number;
    role: string;
};

@Injectable()
export class UsersService {

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async findOnByEmail(email: string): Promise<User | undefined> {
        const result = await 
 
        this.db.select({
          id:  usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          password: usersTable.password,
          created_at: usersTable.created_at,
          roles_id: usersTable.roles_id,
          role: roleTable.name,
        })
        .from(usersTable)
        .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) )
        .where(eq(usersTable.email , email ));
        return result[0];
    }

    async getUserbyId(id:number) {
    
      try{
  
        const result = await this.db.select()
          .from(usersTable)
          .where(eq( usersTable.id, id ));
    
        return result[0] || null;
        
      }catch(err){
        console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
        throw new Error("Error al obtener el usuario " + id + " " + err);
      }
    }

      async createUser( createUser : SignupDto){
    
        try {
     
            const hash = await argon2.hash( createUser.password );
 
            const result = await  this.db.select().from(usersTable)

            const newUser = {
              ...createUser,
              password: hash, 
              // roles_id: 1,
              status: STATUS_ACTIVO
            };
      
          await this.db.insert(usersTable).values(newUser);
    
        } catch (err) {
    
          throw new Error("Error al crear un usuario " + err);
        }
    
         return "Usuario registrado";
      }

      async updateUser( createUser: CreateUserDto){
        try {
          const upd = {
          name: createUser.name,
          lastname: createUser.lastname,
          birthdate: createUser.birthdate,
          email: createUser.email,
          password: createUser.password,
          url_image: createUser.url_image,
          status: STATUS_UPDATED,
          roles_id: createUser.roles_id,
          updated_at: new Date(),
        }
          
        let g = await this.getUserbyId(createUser.id)        

        return  await this.db.update(usersTable)
          .set(upd)
          .where(eq(usersTable.id,  createUser.id))
          .returning({ updatedId: usersTable.id }); //salida: [{"updatedId": 2 }]

        } catch (err) {
    
          throw new Error("Error al actualizar un usuario " + err);
        }
      }

      delete(id:number){
        return this.db.delete(usersTable).where(eq(usersTable.id, id));
      }
}