"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const argon2 = require("argon2");
let UsersService = class UsersService {
    constructor(db) {
        this.db = db;
    }
    async findOnByEmail(email, isSignUp = false) {
        const result = await this.db.select({
            id: schema_1.usersTable.id,
            email: schema_1.usersTable.email,
            password: schema_1.usersTable.password,
            roles_ids: schema_1.usersTable.roles_ids,
            school_id: schema_1.usersTable.school_id,
        })
            .from(schema_1.usersTable)
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email));
        const user = result[0];
        if (!user && !isSignUp) {
            throw new common_1.NotFoundException(`Usuario con correo ${email} no encontrado.`);
        }
        if (!user) {
            return user;
        }
        const roles = await this.db
            .select({ name: schema_1.roleTable.name })
            .from(schema_1.roleTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.roleTable.id} IN (${drizzle_orm_1.sql.join(user.roles_ids.map(id => drizzle_orm_1.sql.raw(`${id}`)), (0, drizzle_orm_1.sql) `, `)})`);
        return {
            ...user,
            roles: roles.map(r => r.name)
        };
    }
    async getUserbyId(id) {
        try {
            const result = await this.db.select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id));
            return result[0] || null;
        }
        catch (err) {
            console.error("Error en la base de datos al buscar el usuario " + id + ": ", err);
            throw new Error("Error al obtener el usuario " + id + " " + err);
        }
    }
    async getByRol(rol_id) {
        try {
            const result = await this.db.select()
                .from(schema_1.usersTable)
                .where((0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${drizzle_orm_1.sql.raw(`'[${rol_id}]'`)}`);
            return result || [];
        }
        catch (err) {
            console.error("Error en la base de datos al buscar usuarios por rol " + rol_id + ": ", err);
            throw new Error("Error al obtener usuarios por rol " + rol_id + " " + err);
        }
    }
    async createUser(createUser) {
        try {
            const hash = await argon2.hash(createUser.password);
            await this.db.select().from(schema_1.usersTable);
            const newUser = {
                ...createUser,
                password: hash,
                status: constants_1.STATUS_ACTIVO
            };
            await this.db.insert(schema_1.usersTable).values(newUser);
        }
        catch (err) {
            throw new Error("Error al crear un usuario " + err);
        }
        return "Usuario registrado";
    }
    async updateUser(user) {
        let email = await this.findOnByEmail(user.email);
        if (!email) {
            throw new Error("No existe el email");
        }
        let id = await this.getUserbyId(user.id);
        if (!id) {
            throw new Error("No existe el id usuario");
        }
        try {
            const updated = {
                name: user.name,
                lastname: user.lastname,
                document_type: user.document_type,
                document_number: user.document_number,
                birthdate: user.birthdate,
                email: user.email,
                school_id: user.school_id,
                representative_id: user.representative_id,
                status: constants_1.STATUS_UPDATED,
                roles_ids: user.roles_ids,
                updated_at: new Date(),
            };
            return await this.db.update(schema_1.usersTable)
                .set(updated)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, user.id))
                .returning({ updatedId: schema_1.usersTable.id });
        }
        catch (err) {
            throw new Error("Error al actualizar un usuario " + err);
        }
    }
    async getPaginatedUsers(page = 1, limit = 10, search, roleFilter) {
        try {
            const offset = (page - 1) * limit;
            const whereConditions = [];
            if (search) {
                const searchPattern = `%${search.toLowerCase()}%`;
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.usersTable.name, searchPattern), (0, drizzle_orm_1.like)(schema_1.usersTable.lastname, searchPattern), (0, drizzle_orm_1.like)(schema_1.usersTable.email, searchPattern)));
            }
            let roleIdToFilter = null;
            if (roleFilter && roleFilter.toLowerCase() !== 'all') {
                const possibleId = parseInt(roleFilter, 10);
                if (!isNaN(possibleId) && possibleId > 0) {
                    roleIdToFilter = possibleId;
                }
                else {
                    whereConditions.push((0, drizzle_orm_1.sql) `false`);
                }
            }
            if (roleIdToFilter !== null) {
                whereConditions.push((0, drizzle_orm_1.sql) `${schema_1.usersTable.roles_ids} @> ${drizzle_orm_1.sql.raw(`'[${roleIdToFilter}]'`)}`);
            }
            const finalWhereCondition = whereConditions.length > 0
                ? (whereConditions.length === 1 ? whereConditions[0] : drizzle_orm_1.sql.join(whereConditions, (0, drizzle_orm_1.sql) ` AND `))
                : undefined;
            const countResult = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.usersTable)
                .where(finalWhereCondition);
            const total = countResult[0].count;
            if (total === 0) {
                throw new common_1.NotFoundException(`No se encontraron usuarios con los filtros proporcionados.`);
            }
            const data = await this.db
                .select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                lastname: schema_1.usersTable.lastname,
                email: schema_1.usersTable.email,
                roles_ids: schema_1.usersTable.roles_ids,
            })
                .from(schema_1.usersTable)
                .where(finalWhereCondition)
                .limit(limit)
                .offset(offset);
            const allRoles = await this.db
                .select({ id: schema_1.roleTable.id, name: schema_1.roleTable.name })
                .from(schema_1.roleTable);
            const roleMap = allRoles.reduce((map, role) => {
                map[role.id] = { id: role.id, name: role.name };
                return map;
            }, {});
            const enrichedData = data.map(user => {
                const roles = user.roles_ids
                    .map(id => roleMap[id])
                    .filter(role => role !== undefined);
                const { roles_ids, ...userData } = user;
                return {
                    ...userData,
                    roles: roles,
                };
            });
            return {
                data: enrichedData,
                total,
                page,
                limit,
            };
        }
        catch (err) {
            console.error('Error al obtener usuarios paginados:', err);
            if (err instanceof common_1.NotFoundException) {
                throw err;
            }
            throw new Error('Error al obtener la lista de usuarios.');
        }
    }
    async findUserDetailById(id) {
        try {
            const userResult = await this.db
                .select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                lastname: schema_1.usersTable.lastname,
                document_type: schema_1.usersTable.document_type,
                document_number: schema_1.usersTable.document_number,
                email: schema_1.usersTable.email,
                birthdate: schema_1.usersTable.birthdate,
                url_image: schema_1.usersTable.url_image,
                roles_ids: schema_1.usersTable.roles_ids,
                school_id: schema_1.usersTable.school_id,
                school_name: schema_1.schoolTable.name,
                representative_id: schema_1.usersTable.representative_id,
            })
                .from(schema_1.usersTable)
                .leftJoin(schema_1.schoolTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.school_id, schema_1.schoolTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id))
                .limit(1);
            const user = userResult[0];
            if (!user) {
                throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
            }
            const roles = await this.db
                .select({
                id: schema_1.roleTable.id,
                name: schema_1.roleTable.name
            })
                .from(schema_1.roleTable)
                .where((0, drizzle_orm_1.sql) `${schema_1.roleTable.id} IN (${drizzle_orm_1.sql.join(user.roles_ids.map(id => drizzle_orm_1.sql.raw(`${id}`)), (0, drizzle_orm_1.sql) `, `)})`);
            const { roles_ids, ...userData } = user;
            return {
                ...userData,
                roles: roles,
            };
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                throw err;
            }
            console.error('Error al obtener el detalle del usuario:', err);
            throw new Error('Error interno al buscar el usuario.');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase])
], UsersService);
//# sourceMappingURL=users.service.js.map