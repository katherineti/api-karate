import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, ParseIntPipe } from '@nestjs/common';
import { TournamentRegistrationsService } from './tournament-registrations.service';
import { CreateTournamentRegistrationDto } from './dto/create-tournament-registration.dto';
import { UpdateTournamentRegistrationDto } from './dto/update-tournament-registration.dto';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';
import { Public } from '../decorators/public.decorator';

@Controller('tournament-registrations')
export class TournamentRegistrationsController {
  constructor(private readonly tournamentRegistrationsService: TournamentRegistrationsService) {}

@Post('bulk')
  // @Rolkes(RoleType.Admin, RoleType.Master) 
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async bulkRegister(
    @Body() dto: CreateTournamentRegistrationDto, // Usando tu nuevo DTO
    @Usersesion() user: IJwtPayload, 
  ) {
    // Pasamos los datos al servicio corregido anteriormente
    return this.tournamentRegistrationsService.bulkRegisterAthletes({
      division_id: dto.division_id,
      athlete_ids: dto.athlete_ids,
      master_id: user.sub,       
      school_id: user.school_id, 
    });
  }

/*
Pagina : Puntuación de Atleta - Campo select: '2. Selecciona el Atleta'
Obtener los atletas(usuarios con rol alumno - id rol 5) que estan inscritos en una division seleccionada(division: evento + categoria+modalidad) y que ademas pertenecen a una escuela seleccionada
*/
@Get('division/:divisionId/school/:schoolId')
async getRegistered(
  @Param('divisionId', ParseIntPipe) divisionId: number,
  @Param('schoolId', ParseIntPipe) schoolId: number,
) {
  return await this.tournamentRegistrationsService.getAthletesByDivisionAndSchool(divisionId, schoolId);
}

/**
   * Pagina : Puntuación de Atleta - Campo select: '1. Selecciona la escuela'
   * Obtiene la lista única de escuelas que tienen los atletas inscritos en una división específica.
   */
  @Public() 
  @Get('schools-by-division/:divisionId')
  async getSchoolsByDivision(
    @Param('divisionId', ParseIntPipe) divisionId: number,
  ) {
    return await this.tournamentRegistrationsService.getSchoolsByDivision(divisionId);
  }

}