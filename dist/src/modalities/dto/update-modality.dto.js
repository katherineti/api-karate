"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateModalityDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_modality_dto_1 = require("./create-modality.dto");
class UpdateModalityDto extends (0, mapped_types_1.PartialType)(create_modality_dto_1.CreateModalityDto) {
}
exports.UpdateModalityDto = UpdateModalityDto;
//# sourceMappingURL=update-modality.dto.js.map