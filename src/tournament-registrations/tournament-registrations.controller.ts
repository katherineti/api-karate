import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, ParseIntPipe } from '@nestjs/common';
import { TournamentRegistrationsService } from './tournament-registrations.service';
import { CreateTournamentRegistrationDto } from './dto/create-tournament-registration.dto';
import { UpdateTournamentRegistrationDto } from './dto/update-tournament-registration.dto';
import { RequestParticipationDto } from './dto/request-participation.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { UploadPaymentProofDto } from './dto/upload-payment-proof.dto';
import { RejectRegistrationDto } from './dto/reject-registration.dto';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/role.decorators';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('tournament-registrations')
export class TournamentRegistrationsController {
  constructor(private readonly tournamentRegistrationsService: TournamentRegistrationsService) {}

/*
La API POST /api/tournament-registrations/bulk se utiliza en la página de "Inscripción de Atletas".
Específicamente, la llamada a la API la realiza el componente EnrollmentForm.tsx cuando un usuario con el rol de "Master" hace clic en el botón "Inscribir Atleta(s)" después de haber seleccionado a los atletas de su escuela.
 */
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

  /**
   * ENDPOINT 1: Alumno solicita participación en un evento
   * 
   * POST /tournament-registrations/request-participation
   * 
   * Autenticación: Requerida (alumno)
   * Rol: alumno
   * 
   * El alumno SOLO envía el event_id (sin elegir categoría ni modalidad)
   * Master decidirá eso después de revisar la solicitud
   */
  @Post('request-participation')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(5) // ID del rol alumno en tu sistema
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async requestParticipation(
    @Body() dto: RequestParticipationDto,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.createParticipationRequest(
      user.sub,
      dto.event_id
    );
  }

  /**
   * ENDPOINT 1B: Master formaliza la inscripción y elige categoría y modalidad
   * 
   * PATCH /tournament-registrations/:id/complete
   * 
   * Autenticación: Requerida
   * Rol: master
   * 
   * El Master revisa la solicitud y elige:
   * - La categoría en la que participará el alumno
   * - La modalidad específica (division_id)
   */
  @Patch(':registrationId/complete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(2) // ID del rol master en tu sistema
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async completeRegistration(
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Body() dto: CompleteRegistrationDto,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.completeRegistrationByMaster(
      registrationId,
      user.sub,
      dto.division_id,
      dto.event_category_id
    );
  }

  /**
   * ENDPOINT 2: Alumno sube comprobante de pago
   * 
   * POST /tournament-registrations/:id/upload-payment
   * 
   * Autenticación: Requerida
   * Rol: alumno
   */
  @Post(':registrationId/upload-payment')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(5) // ID del rol alumno
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async uploadPaymentProof(
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Body() dto: UploadPaymentProofDto,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.uploadPaymentProof(
      registrationId,
      user.sub,
      dto.payment_method,
      dto.payment_reference,
      dto.payment_proof_url
    );
  }

  /**
   * ENDPOINT 3: Master ve todas las inscripciones de su evento
   * 
   * GET /tournament-registrations/event/:eventId/registrations
   * 
   * Autenticación: Requerida
   * Rol: master
   */
  @Get('event/:eventId/registrations')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(2) // ID del rol master en tu sistema
  async getEventRegistrations(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.getEventRegistrations(eventId, user.sub);
  }

  /**
   * ENDPOINT 4: Master valida una inscripción
   * 
   * PATCH /tournament-registrations/:id/validate
   * 
   * Autenticación: Requerida
   * Rol: master
   */
  @Patch(':registrationId/validate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(2) // ID del rol master
  async validateRegistration(
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.validateRegistration(registrationId, user.sub);
  }

  /**
   * ENDPOINT 5: Master valida el pago
   * 
   * PATCH /tournament-registrations/:id/validate-payment
   * 
   * Autenticación: Requerida
   * Rol: master
   */
  @Patch(':registrationId/validate-payment')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(2) // ID del rol master
  async validatePayment(
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.validatePayment(registrationId, user.sub);
  }

  /**
   * ENDPOINT 6: Master rechaza una inscripción
   * 
   * PATCH /tournament-registrations/:id/reject
   * 
   * Autenticación: Requerida
   * Rol: master
   */
  @Patch(':registrationId/reject')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(2) // ID del rol master
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async rejectRegistration(
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Body() dto: RejectRegistrationDto,
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.rejectRegistration(
      registrationId,
      user.sub,
      dto.rejection_reason
    );
  }

  /**
   * ENDPOINT 7: Alumno ve eventos disponibles con su estado de inscripción
   * 
   * GET /tournament-registrations/athlete/my-events
   * 
   * Autenticación: Requerida
   * Rol: alumno
   * 
   * Respuesta incluye:
   * - Lista de todos los eventos activos
   * - Para cada evento: si el alumno está inscrito o no
   * - Si está inscrito: estado de inscripción y de pago
   */
  @Get('athlete/my-events')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(5) // ID del rol alumno
  async getMyEvents(
    @Usersesion() user: IJwtPayload,
  ) {
    return await this.tournamentRegistrationsService.getEventsWithEnrollmentStatus(user.sub);
  }

}
