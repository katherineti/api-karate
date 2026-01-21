import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { EventConfigService } from './event-config.service';
import { ToggleModalityDto } from './dto/toggle-modality.dto';

@Controller('event-config')
export class EventConfigController {
  constructor(private readonly eventConfigService: EventConfigService) {}

  @Post('setup')
  setup(@Body() dto: any) {
    return this.eventConfigService.setupDivision(dto);
  }

  @Patch('event/:eventId/category/:categoryId/change-status')
  async toggleCategoryStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body('is_active') is_active: boolean,
  ) {
    return this.eventConfigService.toggleCategoryStatusInEvent(eventId, categoryId, is_active);
  }

  @Get('event/:id/categories')
  getEventCategories(@Param('id', ParseIntPipe) id: number) {
    return this.eventConfigService.getCategoriesByEvent(id);
  }

  //agrega o cambia el status de la modalidad de un evento+categoria: permite enviar la combinación de evento + categoría + modalidad y que el sistema decida si debe crear la fila o simplemente cambiar el estado de is_active
  @Patch('toggle-modality')
  toggleModality(@Body() dto: ToggleModalityDto) {
    return this.eventConfigService.toggleModalityConfig(dto);
  }
}