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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const neon_serverless_1 = require("drizzle-orm/neon-serverless");
const constants_1 = require("../constants");
const users_service_1 = require("../users/users.service");
const argon2 = require("argon2");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    constructor(db, usersService, jwtService) {
        this.db = db;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async signIn(email, password) {
        const user = await this.usersService.findOnByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException("Usuario no encontrado");
        }
        const authorized = await argon2.verify(user.password, password);
        if (!authorized) {
            throw new common_1.UnauthorizedException("Contraseña incorrecta");
        }
        const payload = {
            sub: user.id,
            email: user.email,
            roles_ids: user.roles_ids,
            roles: (user.roles_ids.length > 0) ? user.roles : null
        };
        console.log("JWTSecret ", constants_1.JWTSecret);
        console.log("payload ", payload);
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: constants_1.JWTSecret
            }),
        };
    }
    async signUp(signUp) {
        const userExist = await this.usersService.findOnByEmail(signUp.email, true);
        if (userExist) {
            throw new common_1.ConflictException('El correo ya existe.');
        }
        await this.usersService.createUser(signUp);
        const objSaved = {
            ok: true,
            status: 201,
            description: 'Usuario registrado',
        };
        return objSaved;
    }
    async updateUser(user) {
        let email = await this.usersService.findOnByEmail(user.email);
        if (!email) {
            throw new Error("No existe el email");
        }
        let id = await this.usersService.getUserbyId(user.id);
        if (!id) {
            throw new Error("No existe el id usuario");
        }
        return await this.usersService.updateUser(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.PG_CONNECTION)),
    __metadata("design:paramtypes", [neon_serverless_1.NeonDatabase,
        users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map