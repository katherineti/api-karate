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
    async findOnByEmail(email) {
        const result = await this.db.select({
            id: schema_1.usersTable.id,
            name: schema_1.usersTable.name,
            lastname: schema_1.usersTable.lastname,
            email: schema_1.usersTable.email,
            password: schema_1.usersTable.password,
            created_at: schema_1.usersTable.created_at,
            roles_id: schema_1.usersTable.roles_id,
            role: schema_1.roleTable.name,
        })
            .from(schema_1.usersTable)
            .innerJoin(schema_1.roleTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.roles_id, schema_1.roleTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.usersTable.email, email));
        return result[0];
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
    async createUser(createUser) {
        try {
            const hash = await argon2.hash(createUser.password);
            const result = await this.db.select().from(schema_1.usersTable);
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
    async updateUser(createUser) {
        try {
            const upd = {
                name: createUser.name,
                lastname: createUser.lastname,
                birthdate: createUser.birthdate,
                email: createUser.email,
                password: createUser.password,
                url_image: createUser.url_image,
                status: constants_1.STATUS_UPDATED,
                roles_id: createUser.roles_id,
                updated_at: new Date(),
            };
            let g = await this.getUserbyId(createUser.id);
            return await this.db.update(schema_1.usersTable)
                .set(upd)
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, createUser.id))
                .returning({ updatedId: schema_1.usersTable.id });
        }
        catch (err) {
            throw new Error("Error al actualizar un usuario " + err);
        }
    }
    async getPaginatedUsers(page, limit) {
        const offset = (page - 1) * limit;
        try {
            const countResult = await this.db
                .select({
                count: (0, drizzle_orm_1.sql) `count(*)`.as('count'),
            })
                .from(schema_1.usersTable);
            const totalItems = countResult[0].count;
            const data = await this.db
                .select({
                id: schema_1.usersTable.id,
                name: schema_1.usersTable.name,
                lastname: schema_1.usersTable.lastname,
                email: schema_1.usersTable.email,
                role: schema_1.roleTable.name,
            })
                .from(schema_1.usersTable)
                .innerJoin(schema_1.roleTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.roles_id, schema_1.roleTable.id))
                .limit(limit)
                .offset(offset);
            return {
                data,
                pagination: {
                    page,
                    limit,
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                },
            };
        }
        catch (err) {
            console.error('Error al obtener usuarios paginados:', err);
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
                email: schema_1.usersTable.email,
                birthdate: schema_1.usersTable.birthdate,
                url_image: schema_1.usersTable.url_image,
                created_at: schema_1.usersTable.created_at,
                updated_at: schema_1.usersTable.updated_at,
                role: schema_1.roleTable.name,
            })
                .from(schema_1.usersTable)
                .innerJoin(schema_1.roleTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.roles_id, schema_1.roleTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, id))
                .limit(1);
            const user = userResult[0];
            if (!user) {
                throw new common_1.NotFoundException(`Usuario con ID ${id} no encontrado.`);
            }
            return user;
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