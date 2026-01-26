import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PuntuationService } from './puntuation.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('puntuation')
export class PuntuationController {
    constructor(private readonly puntuationService: PuntuationService) {}
    
    @Get('athletes-by-school/:school_id') //protegido
    // @UseGuards(AuthGuard)
    async getAthleteBySchool(@Param('school_id') school_id: number) {
        return this.puntuationService.getAthletesBySchool(school_id);
    }
}
