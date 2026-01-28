"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTournamentRegistrationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_tournament_registration_dto_1 = require("./create-tournament-registration.dto");
class UpdateTournamentRegistrationDto extends (0, mapped_types_1.PartialType)(create_tournament_registration_dto_1.CreateTournamentRegistrationDto) {
}
exports.UpdateTournamentRegistrationDto = UpdateTournamentRegistrationDto;
//# sourceMappingURL=update-tournament-registration.dto.js.map