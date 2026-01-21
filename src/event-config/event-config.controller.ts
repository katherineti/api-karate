import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { EventConfigService } from './event-config.service';

@Controller('event-config')
export class EventConfigController {
  constructor(private readonly eventConfigService: EventConfigService) {}

  @Post('setup')
  setup(@Body() dto: any) {
    return this.eventConfigService.setupDivision(dto);
  }

  @Get('event/:id/categories')
  getEventCategories(@Param('id', ParseIntPipe) id: number) {
    return this.eventConfigService.getCategoriesByEvent(id);
  }
}