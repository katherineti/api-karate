"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = exports.ROL_ALUMNO = exports.STATUS_UPDATED = exports.STATUS_INACTIVO = exports.STATUS_ACTIVO = exports.JWTSecret = exports.PG_CONNECTION = void 0;
require("dotenv/config");
exports.PG_CONNECTION = 'PG_CONNECTION';
exports.JWTSecret = process.env.JWT_SECRET;
exports.STATUS_ACTIVO = 1;
exports.STATUS_INACTIVO = 2;
exports.STATUS_UPDATED = 3;
exports.ROL_ALUMNO = 5;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET
};
//# sourceMappingURL=constants.js.map