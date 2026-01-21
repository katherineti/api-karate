"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEventConfigDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_event_config_dto_1 = require("./create-event-config.dto");
class UpdateEventConfigDto extends (0, mapped_types_1.PartialType)(create_event_config_dto_1.CreateEventConfigDto) {
}
exports.UpdateEventConfigDto = UpdateEventConfigDto;
//# sourceMappingURL=update-event-config.dto.js.map