import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ParticipantRequestsService } from './participantRequests.service';
import { Usersesion } from '../../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../../auth/dto/jwt-payload.interface';
import { CreateParticipantRequestDto } from './createParticipantRequest.dto';

@Controller('participantRequests')
export class ParticipantRequestsController {
  constructor(private readonly participantRequestsService: ParticipantRequestsService) {}
//  @Public()
  @Post('request-slots')
    // @UseGuards(AuthGuard)
    async createParticipantRequest(
    @Body() dto: CreateParticipantRequestDto,
    @Usersesion() user: IJwtPayload
    ) {
    return this.participantRequestsService.createParticipantRequest(dto, user);
    }

  @Patch(':id/approve')
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Usersesion() user: IJwtPayload
  ) {
    // user.sub es el ID del usuario en sesión (el creador del evento)
    return this.participantRequestsService.approveRequest(id, user.sub);
  }

// participantRequests.controller.ts

@Patch(':id/reject')
async reject(
  @Param('id', ParseIntPipe) id: number,
  @Body('reason') reason: string, // El admin explica por qué rechaza
  @Usersesion() user: IJwtPayload
) {
  return this.participantRequestsService.rejectRequest(id, user.sub, reason || 'No especificado');
}
}