import { ConflictException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, ROL_ALUMNO, STATUS_ACTIVO, STATUS_INACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable, schoolTable, karateCategoriesTable, karateBeltsTable, tournamentRegistrationsTable } from 'src/db/schema';
import { and, eq, inArray, like, ne, notExists, or, SQL, sql } from 'drizzle-orm'
import * as argon2 from "argon2";
import { SignupDto } from '../auth/dto/signup.dto';
import { IPaginatedResponse, IPaginatedUser, IRole } from './interfaces/paginated-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { alias } from 'drizzle-orm/pg-core';

export type User = {
  id: number;
  name?: string;
  lastname?: string;
  email: string;
  password: string;
  profile_picture?: string;
  school_id?: number;
  representative_id?: number[];
  status?: number;
  roles_ids: number[];
  roles?:string[];
  category_id?: number;
  belt_id?: number;
  created_at?: Date;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async findOnByEmail(email: string, isSignUp=false): Promise<User | undefined> {//se usa en el signIn y signUp
        const result = await  
        this.db.select({
          id:  usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          password: usersTable.password,
          roles_ids: usersTable.roles_ids,
          school_id: usersTable.school_id,
        })
        .from(usersTable)
        .where(eq(usersTable.email , email ));

      const user = result[0];

      if (!user && !isSignUp) {
        throw new NotFoundException(`Usuario con correo ${email} no encontrado.`);
      }

      if(!user){
        return user;
      }

      const roles = await this.db
            .select({ name: roleTable.name })
            .from(roleTable)
            .where(sql`${roleTable.id} IN (${sql.join(user.roles_ids.map(id => sql.raw(`${id}`)), sql`, `)})`);
            
      return {
          ...user,
          roles: roles.map(r => r.name)
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

    async getByRol(rol_id:number): Promise<any[]> {
      try{
        const roleCondition = sql`${usersTable.roles_ids} @> ${sql.raw(`'[${rol_id}]'`)}`;

        const statusCondition = ne(usersTable.status, STATUS_INACTIVO);
        
        const result = await this.db.select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          email: usersTable.email,
          roles_ids: usersTable.roles_ids,
          // Campos de la escuela
          school_id: schoolTable.id,
          school_name: schoolTable.name,
        })
          .from(usersTable)
          .leftJoin(schoolTable, eq(usersTable.school_id, schoolTable.id))
          .where(and(roleCondition, statusCondition));
    
        return result || [];
        
      }catch(err){
        console.error("Error en la base de datos al buscar usuarios por rol " + rol_id + ": ", err);
        throw new Error("Error al obtener usuarios por rol " + rol_id + " " + err);
      }
    }

    async createUser( createUser : SignupDto){
      try {
          const hash = await argon2.hash( createUser.password );

          await  this.db.select().from(usersTable)

          const newUser = {
            ...createUser,
            password: hash, 
            status: STATUS_ACTIVO
          };
    
        await this.db.insert(usersTable).values(newUser);
  
      } catch (err) {
  
        throw new Error("Error al crear un usuario " + err);
      }
  
        return "Usuario registrado";
    }

   async updateUser(user:UpdateUserDto): Promise<{ updatedId: number }[]> { console.log("userupdate",user)
      // 1. Validar que el ID del usuario a actualizar existe
      const userToUpdate = await this.getUserbyId(user.id);
      if (!userToUpdate) {
          // Lanza 404
          throw new NotFoundException(`No existe el usuario con ID ${user.id} para actualizar.`);
      }
      // 2. Validar conflicto de email: El email nuevo no debe pertenecer a otro usuario
      const existingEmailUser = await this.findOneByEmailExcludingId(user.email, user.id);
      if (existingEmailUser) {
          // Lanza 409
          throw new ConflictException(`El email ${user.email} ya está registrado por otro usuario.`);
      }

      try {
        const updated = {
          name: user.name,
          lastname: user.lastname,
          document_type: user.document_type, 
          document_number: user.document_number,
          birthdate: user.birthdate,
          email: user.email,
          profile_picture: user.profile_picture,
          school_id: user.school_id,
          representative_id: user.representative_id ?? [],//representante del alumno
          status: STATUS_UPDATED,
          roles_ids: user.roles_ids ?? [],
          category_id: user.category_id,
          belt_id: user.belt_id,
          updated_at: new Date(),
        }
        console.log("update-obj que se envia a BD: ",updated)
        return await this.db.update(usersTable)
          .set(updated)
          .where(eq(usersTable.id,  user.id))
          .returning({ updatedId: usersTable.id }); //salida: [{"updatedId": 2 }]

      } catch (err) {
        throw new Error("Error al actualizar un usuario " + err);
      }
    }

    async changeStatus(user:UpdateUserDto): Promise<{ updatedId: number }[]> {
      let id= await this.getUserbyId(user.id);
      if( !id ){
        throw new Error("No existe el id usuario");
      }

      try {
        const updated = {
          email: user.email,
          roles_ids: user.roles_ids,
          status: user.status,
          updated_at: new Date(),
        }
        
        return await this.db.update(usersTable)
          .set(updated)
          .where(eq(usersTable.id,  user.id))
          .returning({ updatedId: usersTable.id }); //salida: [{"updatedId": 2 }]

      } catch (err) {
        throw new Error("Error al actualizar un usuario " + err);
      }
    }

    /**
     * Obtiene la lista de usuarios paginada.
     * @param page - Número de página.
     * @param limit - Límite de registros por página.
     * @param roleFilter Filtra por ID de rol (number en string) o lista todos (con 'all').
     * @returns Un objeto con los datos, el total y la paginación.
     */
    async getPaginatedUsers(
        page: number = 1, 
        limit: number = 10,
        search?: string, 
        roleFilter?: string, 
    ): Promise<IPaginatedResponse> {
        try {
            const offset = (page - 1) * limit;
            const whereConditions: SQL<unknown>[] = [];

            // --- 1. Lógica de Filtrado por Búsqueda (Search) ---
            if (search) {
                const searchPattern = `%${search.toLowerCase()}%`;
                whereConditions.push(
                    or(
                        like(usersTable.name, searchPattern),
                        like(usersTable.lastname, searchPattern),
                        like(usersTable.email, searchPattern)
                    ) as SQL<unknown>
                );
            }

            // --- 2. Lógica de Filtrado por Rol (ID Numérico o 'all') ---
            let roleIdToFilter: number | null = null;
            
            if (roleFilter && roleFilter.toLowerCase() !== 'all') {
                
                const possibleId = parseInt(roleFilter, 10);

                if (!isNaN(possibleId) && possibleId > 0) {
                    roleIdToFilter = possibleId;
                } else {
                    // Si no es 'all' ni un ID numérico válido, forzamos resultado vacío
                    whereConditions.push(sql`false` as SQL<unknown>);
                }
            }

            if (roleIdToFilter !== null) {
                // Filtro para verificar si el array JSONB 'roles_ids' contiene el 'roleIdToFilter'
                whereConditions.push(
                    sql`${usersTable.roles_ids} @> ${sql.raw(`'[${roleIdToFilter}]'`)}` as SQL<unknown>
                );
            }
            
            // Combinar las Condiciones WHERE ---
            const finalWhereCondition = whereConditions.length > 0 
                ? (whereConditions.length === 1 ? whereConditions[0] : sql.join(whereConditions, sql` AND `))
                : undefined;

            // Consulta para obtener el TOTAL (COUNT) ---
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(usersTable)
                .where(finalWhereCondition); 

            const total = countResult[0].count;
            
            if (total === 0) {
                throw new NotFoundException(`No se encontraron usuarios con los filtros proporcionados.`);
            }

            // Consulta para obtener los DATOS paginados ---
            const data = await this.db
                .select({
                    id: usersTable.id,
                    name: usersTable.name,
                    lastname: usersTable.lastname,
                    email: usersTable.email,
                    roles_ids: usersTable.roles_ids,
                    status: usersTable.status,
                })
                .from(usersTable)
                .where(finalWhereCondition) 
                .limit(limit)
                .offset(offset);

            // Mapear IDs de Rol a Objetos de Rol ---
            const allRoles = await this.db
                .select({ id: roleTable.id, name: roleTable.name }) 
                .from(roleTable);

            const roleMap = allRoles.reduce((map, role) => {
                map[role.id] = { id: role.id, name: role.name };
                return map;
            }, {} as Record<number, IRole>);

            const enrichedData: IPaginatedUser[] = data.map(user => {
                const roles: IRole[] = user.roles_ids
                    .map(id => roleMap[id]) 
                    .filter(role => role !== undefined) as IRole[];
                
                // Usamos destructuring para excluir 'roles_ids' del objeto final
                const { roles_ids, ...userData } = user;
                
                return {
                    ...userData,
                    roles: roles,
                } as IPaginatedUser;
            });

            return {
                data: enrichedData,
                total,
                page,
                limit,
            };

        } catch (err) {
            console.error('Error al obtener usuarios paginados:', err);
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new Error('Error al obtener la lista de usuarios.');
        }
    }

/*
   * Para el Modal: Gestión de Usuarios - Ver y Editar del Usuario.
   * Obtiene el detalle completo de un usuario por su ID.
*/
  async findUserDetailById(id: number): Promise<any> {
    try {
      const representativeTable = alias(usersTable, 'representative_user');
      const userResult = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          document_type: usersTable.document_type, 
          document_number: usersTable.document_number,
          email: usersTable.email,
          birthdate: usersTable.birthdate,
          profile_picture: usersTable.profile_picture,
          roles_ids: usersTable.roles_ids,
          school_id: usersTable.school_id,
          school_name: schoolTable.name,
          representative_id: usersTable.representative_id,
/*           representative_name: representativeTable.name,
          representative_lastname: representativeTable.lastname,
          representative_email: representativeTable.email, */
          category_id: usersTable.category_id,
          category_name: karateCategoriesTable.category,
          belt_id: usersTable.belt_id,
          belt_name: karateBeltsTable.belt,
        })
        .from(usersTable)
        .leftJoin(schoolTable, eq(usersTable.school_id, schoolTable.id))
        // .leftJoin(representativeTable, eq(usersTable.representative_id, representativeTable.id))
        .leftJoin(karateCategoriesTable, eq(usersTable.category_id, karateCategoriesTable.id))
        .leftJoin(karateBeltsTable, eq(usersTable.belt_id, karateBeltsTable.id))
        .where(eq(usersTable.id, id)) 
        .limit(1); 

      const user = userResult[0];

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
      }

      const roles = await this.db
            .select({ 
                id: roleTable.id, 
                name: roleTable.name 
            })
            .from(roleTable)
            .where(sql`${roleTable.id} IN (${sql.join(user.roles_ids.map(id => sql.raw(`${id}`)), sql`, `)})`);

      let representatives = [];
        if (user.representative_id && user.representative_id.length > 0) {
          representatives = await this.db
            .select({
              id: usersTable.id,
              name: usersTable.name,
              lastname: usersTable.lastname,
              email: usersTable.email,
            })
            .from(usersTable)
          .where(inArray(usersTable.id, user.representative_id));
      }

        //Devolver el objeto de usuario enriquecido
        const { roles_ids, representative_id, ...userData } = user;

        return {
            ...userData,
            roles: roles, //Arreglo de objetos { id: number, name: string }
            representatives: representatives,
        };

    } catch (err) {
      if (err instanceof NotFoundException) {
          throw err;
      }
      console.error('Error al obtener el detalle del usuario:', err);
      throw new Error('Error interno al buscar el usuario.');
    }
  }

/**
     * Busca un usuario por email, excluyendo un ID específico.
     * @param email - Correo a buscar.
     * @param excludeId - ID del usuario actual que se debe excluir de la búsqueda de conflicto.
     * @returns El usuario encontrado o undefined.
     */
    async findOneByEmailExcludingId(email: string, excludeId: number): Promise<any> {
        const result = await this.db.select({
            id: usersTable.id,
            email: usersTable.email,
        })
        .from(usersTable)
        .where(and(
            eq(usersTable.email, email),
            ne(usersTable.id, excludeId) // Excluir el ID del usuario que se está actualizando
        ));
        
        return result[0];
    }

  async validarAdmin(email: string): Promise<any> {
    try {
      const userExists = await 
      this.db.select({
        isActivate: usersTable.status, //=1
        })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

      if (userExists) {
        return userExists[0]
      } else {
        return null
      }

    } catch (error) {
      this.logger.error("Error al buscar el usuario: ", error);
      throw error;
    }
  }

async getAlumnosByEscuela(schoolId: number, divisionId?: number) {
  try {
    const estadosPermitidos = [STATUS_ACTIVO, STATUS_UPDATED];

// Iniciamos la consulta base
    let query = this.db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        lastname: usersTable.lastname,
        email: usersTable.email,
        school_id: usersTable.school_id,
        status: usersTable.status,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.school_id, schoolId),
          inArray(usersTable.status, estadosPermitidos),
          sql`${usersTable.roles_ids} @> ${JSON.stringify([ROL_ALUMNO])}::jsonb`,
          
          // LÓGICA DE FILTRADO:
          // Si mandan divisionId, excluimos a los que ya están en tournament_registrations
          divisionId 
            ? notExists(
                this.db
                  .select()
                  .from(tournamentRegistrationsTable)
                  .where(
                    and(
                      eq(tournamentRegistrationsTable.athlete_id, usersTable.id),
                      eq(tournamentRegistrationsTable.division_id, divisionId)
                    )
                  )
              )
            : undefined
        )
      );

    return await query;
  } catch (error) {
    this.logger.error(`Error al obtener alumnos de la escuela ${schoolId}:`, error);
    // Imprimimos el error original para debuggear mejor
    console.error(error); 
    throw new Error('Error al obtener la lista de alumnos disponibles.');
  }
}
}