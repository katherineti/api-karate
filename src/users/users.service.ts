import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { PG_CONNECTION, STATUS_ACTIVO, STATUS_UPDATED } from 'src/constants';
import { roleTable, usersTable, schoolTable } from 'src/db/schema';
import { eq, like, or, SQL, sql } from 'drizzle-orm'
import * as argon2 from "argon2";
import { SignupDto } from '../auth/signup.dto';
import { IPaginatedResponse, IPaginatedUser, IRole } from './interfaces/paginated-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

export type User = {
  id: number;
  name?: string;
  lastname?: string;
  email: string;
  password: string;
  school_id?: number;
  status?: number;
  roles_ids: number[];
  roles?:string[];
  created_at?: Date;
};

@Injectable()
export class UsersService {

 constructor(@Inject(PG_CONNECTION) private db: NeonDatabase) {}

    async findOnByEmail(email: string, isSignUp=false): Promise<User | undefined> {
        const result = await  
        this.db.select({
          id:  usersTable.id,
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

    async updateUser(user:UpdateUserDto): Promise<any> {
      let email = await this.findOnByEmail(user.email)
      if( !email){
        throw new Error("No existe el email");
      }

      let id= await this.getUserbyId(user.id);
      if( !id ){
        throw new Error("No existe el id usuario");
      }

      try {
        const updated = {
          name: user.name,
          lastname: user.lastname,
          birthdate: user.birthdate,
          email: user.email,
          school_id: user.school_id,
          status: STATUS_UPDATED,
          roles_ids: user.roles_ids,
          updated_at: new Date(),
        }
        
        return  await this.db.update(usersTable)
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
            
            // --- 3. Combinar las Condiciones WHERE ---
            const finalWhereCondition = whereConditions.length > 0 
                ? (whereConditions.length === 1 ? whereConditions[0] : sql.join(whereConditions, sql` AND `))
                : undefined;

            // --- 4. Consulta para obtener el TOTAL (COUNT) ---
            const countResult = await this.db
                .select({ count: sql<number>`count(*)` })
                .from(usersTable)
                .where(finalWhereCondition); 

            const total = countResult[0].count;
            
            if (total === 0) {
                throw new NotFoundException(`No se encontraron usuarios con los filtros proporcionados.`);
            }

            // --- 5. Consulta para obtener los DATOS paginados ---
            const data = await this.db
                .select({
                    id: usersTable.id,
                    name: usersTable.name,
                    lastname: usersTable.lastname,
                    email: usersTable.email,
                    roles_ids: usersTable.roles_ids,
                })
                .from(usersTable)
                .where(finalWhereCondition) 
                .limit(limit)
                .offset(offset);

            // --- 6. ENRIQUECIMIENTO: Mapear IDs de Rol a Objetos de Rol ---
            // Optimizamos obteniendo todos los roles una sola vez
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

            // --- 7. Retorno Final ---
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
      const userResult = await this.db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          lastname: usersTable.lastname,
          document_type: usersTable.document_type, 
          document_number: usersTable.document_number,
          email: usersTable.email,
          birthdate: usersTable.birthdate,
          url_image: usersTable.url_image,
          roles_ids: usersTable.roles_ids,
          school_id: usersTable.school_id,
          school_name: schoolTable.name,
        })
        .from(usersTable)
        .leftJoin(schoolTable, eq(usersTable.school_id, schoolTable.id))
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
 
        //Devolver el objeto de usuario enriquecido
        const { roles_ids, ...userData } = user;

        return {
            ...userData,
            roles: roles, //Arreglo de objetos { id: number, name: string }
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