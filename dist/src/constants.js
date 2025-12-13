"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_UPDATED = exports.STATUS_ACTIVO = exports.JWTSecret = exports.PG_CONNECTION = void 0;
require("dotenv/config");
exports.PG_CONNECTION = 'PG_CONNECTION';
exports.JWTSecret = process.env.JWT_SECRET;
exports.STATUS_ACTIVO = 1;
exports.STATUS_UPDATED = 3;
//# sourceMappingURL=constants.js.map