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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del usuario debe ser un número válido.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del usuario es requerido para la actualización.' }),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El apellido debe ser una cadena de texto.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastname", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El tipo de documento debe ser una cadena de texto válida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "document_type", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El número de documento debe ser una cadena de texto válida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "document_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)({ message: 'La fecha de nacimiento debe ser un formato de fecha válido (YYYY-MM-DD).' }),
    (0, class_validator_1.MaxDate)(new Date(), { message: 'La fecha de nacimiento no puede ser en el futuro.' }),
    __metadata("design:type", Date)
], UpdateUserDto.prototype, "birthdate", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'El correo electrónico debe ser una dirección válida.' }),
    (0, class_validator_1.IsString)({ message: 'El correo electrónico debe ser una cadena de texto.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El correo electrónico es obligatorio.' }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'La foto de perfil debe ser una URL o cadena de texto válida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "profile_picture", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la escuela debe ser un número válido.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "school_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del representante debe ser un número válido.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "representative_id", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Los roles deben ser proporcionados como un arreglo (roles_ids).' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Se debe asignar al menos un rol al usuario.' }),
    (0, class_validator_1.IsNumber)({}, { each: true, message: 'Cada elemento en roles_ids debe ser un número (ID de rol).' }),
    __metadata("design:type", Array)
], UpdateUserDto.prototype, "roles_ids", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la categoría de karate debe ser un número válido.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "category_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del cinturón de karate debe ser un número válido.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "belt_id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El estado del usuario debe ser un número válido (ej: 1 para Activo).' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUserDto.prototype, "status", void 0);
//# sourceMappingURL=update-user.dto.js.map