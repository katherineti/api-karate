import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes } from '@nestjs/common';
import { TournamentRegistrationsService } from './tournament-registrations.service';
import { CreateTournamentRegistrationDto } from './dto/create-tournament-registration.dto';
import { UpdateTournamentRegistrationDto } from './dto/update-tournament-registration.dto';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';

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

}