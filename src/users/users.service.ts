import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable } from 'src/db/schema';
import { eq, like, or, SQL, sql } from 'drizzle-orm'
import * as argon2 from "argon2";
import { CreateUserDto } from './dto/create-user.dto';
import { SignupDto } from '../auth/signup.dto';

export type User = {
    id: number;
    name: string;
    lastname: string;
    // age: number;
    email: string;
    password: string;
    created_at: Date;
    // roles_id: number;
    // role: string;
    roles_ids: number[];
    roles?:string[];
};

@Injectable()
export class UsersService {

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    // async findOnByEmail(email: string, isSignUp=false): Promise<User | undefined> {
    async findOnByEmail(email: string, isSignUp=false): Promise<User | undefined> {
        const result = await  
        this.db.select({
          id:  usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          password: usersTable.password,
          created_at: usersTable.created_at,
          // Obtener el arreglo de IDs:
          roles_ids: usersTable.roles_ids,
          // role: roleTable.name,
        })
        .from(usersTable)
        // .innerJoin( roleTable, or( ...usersTable.roles_ids.map( id => eq( id, roleTable.id ) ) ) )  
        .where(eq(usersTable.email , email ));
        // return result[0];

      const user = result[0];

      if (!user && !isSignUp) {
        throw new NotFoundException(`Usuario con correo ${email} no encontrado.`);
      }

      if(!user){
        return user;
      }

      // 2. Obtener los nombres de los roles basados en los IDs
      const roles = await this.db
            .select({ name: roleTable.name })
            .from(roleTable)
            .where(sql`${roleTable.id} IN (${sql.join(user.roles_ids.map(id => sql.raw(`${id}`)), sql`, `)})`);
            // O, si Drizzle soporta el operador ANY:
            // .where(sql`${roleTable.id} = ANY(${user.roles_ids})`); 
  
      // 3. Devolver el objeto de usuario enriquecido
      return {
          ...user,
          roles: roles.map(r => r.name), // Arreglo de strings con los nombres de roles
      };
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
 
            await  this.db.select().from(usersTable)

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
          roles_id: createUser.roles_ids,
          updated_at: new Date(),
        }
          
        await this.getUserbyId(createUser.id)        

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
async getPaginatedUsers(
    page: number = 1, 
    limit: number = 10,
    search?: string, // Búsqueda por nombre, apellido, email
    roleName?: string, // Búsqueda por nombre de rol
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const offset = (page - 1) * limit;

      // --- 1. Crear el filtro de búsqueda dinámico ---
      const whereConditions: SQL<unknown>[] = [];

      if (search) {
        // Filtro OR: busca en name, lastname o email
        const searchPattern = `%${search.toLowerCase()}%`;
        whereConditions.push(
          or(
            like(usersTable.name, searchPattern),
            like(usersTable.lastname, searchPattern),
            like(usersTable.email, searchPattern)
          ) as SQL<unknown>
        );
      }

      if (roleName) {
        // Filtro por Rol: Obtiene ID y aplica filtro JSONB '@>'
        const role = await this.db.select({ id: roleTable.id })
            .from(roleTable)
            .where(eq(roleTable.name, roleName))
            .limit(1);

        if (role.length > 0) {
            const roleId = role[0].id;
            whereConditions.push(
                sql`${usersTable.roles_ids} @> ${sql.raw(`'[${roleId}]'`)}` as SQL<unknown>
            );
        } else {
            whereConditions.push(sql`false` as SQL<unknown>);
        }
      }
      
      // Combinar todos los filtros en una sola expresión OR si existe, 
      // pero para la función where(), simplemente pasaremos el resultado de 'or()' si hay condiciones.
      const finalWhereCondition = whereConditions.length > 0 
        ? (whereConditions.length === 1 ? whereConditions[0] : sql.join(whereConditions, sql` AND `))
        : undefined;


      // --- 2. Consulta para obtener el TOTAL (COUNT) ---
      const countResult = await this.db
          .select({ count: sql<number>`count(*)` })
          .from(usersTable)
          .where(finalWhereCondition); // Aplicar el filtro a la tabla users directamente

      const total = countResult[0].count;
      
      // --- 3. Consulta para obtener los DATOS PAGINADOS ---
      const data = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          // role: roleTable.name,
          roles_ids: usersTable.roles_ids,
        })
        .from(usersTable)
        // .innerJoin(roleTable, eq(usersTable.roles_ids, roleTable.id))
        .where(finalWhereCondition) 
        .limit(limit)
        .offset(offset);

     if (total === 0) {
          throw new NotFoundException(`No se encontraron usuarios con los filtros proporcionados.`);
      }

      // a. Obtener TODOS los roles de la DB
      const allRoles = await this.db
        .select({ id: roleTable.id, name: roleTable.name }) 
        .from(roleTable);

      // b. Mapear roles a un objeto para búsqueda rápida O(1)
      const roleMap = allRoles.reduce((map, role) => {
          map[role.id] = { id: role.id, name: role.name }; 
          return map;
      }, {} as Record<number, { id: number, name: string }>);

      // c. Mapear los datos de usuario para incluir el array de objetos de roles
      const enrichedData = data.map(user => {
          
          // 1. Crear el array de objetos de rol
          const roles = user.roles_ids
              .map(id => roleMap[id]) 
              .filter(role => role !== undefined);
          
          // 2. Desestructurar y omitir roles_ids
          const { roles_ids, ...userData } = user; // 💥 Omitir roles_ids
          
          return {
              ...userData, // Contiene id, name, lastname, email, etc.
              roles: roles, // Array de objetos {id, name}
          };
      });
      // ----------------------------------------------------------------

      return {
        data: enrichedData,
        total,
        page,
        limit,
      };
    } catch (err) {
      console.error('Error al obtener usuarios paginados:', err);
      throw new Error('Error al obtener la lista de usuarios.');
    }
  }

/*   async getPaginatedUsers(page: number, limit: number): Promise<any> {
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
  } */

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
          roles_ids: usersTable.roles_ids,
          // role: roleTable.name, // Nombre del rol
          // Añade aquí cualquier otro campo que necesites: telefono, direccion, historial, etc.
        })
        .from(usersTable)
        // .innerJoin(roleTable, eq(usersTable.roles_ids, roleTable.id))
        .where(eq(usersTable.id, id)) 
        .limit(1); 

      const user = userResult[0];

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }

      // 2. Obtener los nombres de los roles basados en los IDs
      const roles = await this.db
            .select({ name: roleTable.name })
            .from(roleTable)
            .where(sql`${roleTable.id} IN (${sql.join(user.roles_ids.map(id => sql.raw(`${id}`)), sql`, `)})`);
            // O, si Drizzle soporta el operador ANY:
            //  .where(sql`${roleTable.id} = ANY(${user.roles_ids})`); 

        // 3. Devolver el objeto de usuario enriquecido
        return {
            ...user,
            roles: roles.map(r => r.name), // Arreglo de strings con los nombres de roles
        };

    } catch (err) {
      if (err instanceof NotFoundException) {
          throw err;
      }
      console.error('Error al obtener el detalle del usuario:', err);
      throw new Error('Error interno al buscar el usuario.');
    }
  }
}