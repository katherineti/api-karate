"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = exports.ROL_REPRESENTANTE = exports.ROL_JUEZ = exports.ROL_ADMIN = exports.ROL_ALUMNO = exports.ROL_MASTER = exports.STATUS_UPDATED = exports.STATUS_INACTIVO = exports.STATUS_ACTIVO = exports.API_BASE_URL_PROD = exports.JWTSecret = exports.PG_CONNECTION = void 0;
require("dotenv/config");
exports.PG_CONNECTION = 'PG_CONNECTION';
exports.JWTSecret = process.env.JWT_SECRET;
exports.API_BASE_URL_PROD = process.env.NEXT_PUBLIC_API_BASE_URL;
exports.STATUS_ACTIVO = 1;
exports.STATUS_INACTIVO = 2;
exports.STATUS_UPDATED = 3;
exports.ROL_MASTER = 2;
exports.ROL_ALUMNO = 5;
exports.ROL_ADMIN = 1;
exports.ROL_JUEZ = 3;
exports.ROL_REPRESENTANTE = 4;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET
};
//# sourceMappingURL=constants.js.map