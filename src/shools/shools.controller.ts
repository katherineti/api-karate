import { Controller, Get, UseGuards } from '@nestjs/common';
import { ShoolsService } from './shools.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('shools')
export class ShoolsController {

    constructor(private readonly shoolsService: ShoolsService) {}
    
    @Get()
    @UseGuards(AuthGuard)
    async getAll() {
    return this.shoolsService.getAll();
    }


}
