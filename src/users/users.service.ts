import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm'
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

/*       delete(id:number){
        return this.db.delete(usersTable).where(eq(usersTable.id, id));
      } */

/**
   * Obtiene la lista de usuarios paginada.
   * @param page - Número de página.
   * @param limit - Límite de registros por página.
   * @returns Un objeto con los datos, el total y la paginación.
   */
  async getPaginatedUsers(page: number, limit: number): Promise<any> {
    const offset = (page - 1) * limit;

    try {
      // 1. 🎯 Obtener el total de registros (CRÍTICO para la paginación)
      // Usamos 'sql' para una consulta de conteo eficiente.
      const countResult = await this.db
        .select({
          count: sql<number>`count(*)`.as('count'), // 👈 Drizzle SQL count
        })
        .from(usersTable);
        
      const totalItems = countResult[0].count;

      // 2. 📝 Obtener los datos de la página actual con JOIN, LIMIT y OFFSET
      const data = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          role: roleTable.name, // Obtiene el nombre del rol para la respuesta
        })
        .from(usersTable)
        .innerJoin(roleTable, eq(usersTable.roles_id, roleTable.id))
        .limit(limit)
        .offset(offset); // 👈 Lógica de Paginación

      // 3. ✨ Retornar el objeto de respuesta completo
      return {
        data,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      };

    } catch (err) {
      console.error('Error al obtener usuarios paginados:', err);
      throw new Error('Error al obtener la lista de usuarios.');
    }
  }

/*
   * Para el Modal: Gestión de Usuarios - Detalles del Usuario.
   * Obtiene el detalle completo de un usuario por su ID.
   * ✅ Nombre mejorado y descriptivo
   */
  async findUserDetailById(id: number): Promise<any> {
    try {
      const userResult = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          birthdate: usersTable.birthdate,
          url_image: usersTable.url_image,
          created_at: usersTable.created_at,
          updated_at: usersTable.updated_at,
          role: roleTable.name, // Nombre del rol
          // Añade aquí cualquier otro campo que necesites: telefono, direccion, historial, etc.
        })
        .from(usersTable)
        .innerJoin(roleTable, eq(usersTable.roles_id, roleTable.id))
        .where(eq(usersTable.id, id)) 
        .limit(1); 

      const user = userResult[0];

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }

      return user;

    } catch (err) {
      if (err instanceof NotFoundException) {
          throw err;
      }
      console.error('Error al obtener el detalle del usuario:', err);
      throw new Error('Error interno al buscar el usuario.');
    }
  }
}