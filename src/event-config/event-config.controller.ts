import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, Req, Headers } from '@nestjs/common';
import { EventConfigService } from './event-config.service';
import { ToggleModalityDto } from './dto/toggle-modality.dto';
import { ToggleEventCategoryDto } from './dto/toggle-event-category.dto';

@Controller('event-config')
export class EventConfigController {
  constructor(private readonly eventConfigService: EventConfigService) {}

  @Post('setup')
  setup(@Body() dto: any) {
    return this.eventConfigService.setupDivision(dto);
  }

  @Patch('event/:eventId/category/:categoryId/change-status')//guardado de los cambios de estado de una modalidad en undivision: evento+categoria
  async toggleCategoryStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body('is_active') is_active: boolean,
  ) {
    return this.eventConfigService.toggleCategoryStatusInEvent(eventId, categoryId, is_active);
  }

  //getEventCategoriesSummary v3 modificada por eventCategoriesTable (Buena)
/*   @Get('event/:id/summary')
  getEventSummary(@Param('id', ParseIntPipe) id: number) {
    return this.eventConfigService.getEventCategoriesSummary(id);
  } */

  //getEventCategoriesSummary v4 modificada por eventCategoriesTable y para mostrar las categorias asignadas a un juez en un evento (por usuario en sesion)
/*   @Get('event/:id/summary')
  getEventSummary(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any // Suponiendo que tienes un Guard que inyecta el usuario
  ) { console.log("# req.user es: ", req.user)
    const userId = req.user.id;
    const userRole = req.user.role; // 'admin' o 'juez'
    return this.eventConfigService.getEventCategoriesSummary(id, userId, userRole);
  } */

@Get('event/:id/summary')
getEventSummary(
  @Param('id', ParseIntPipe) id: number,
  @Headers('user-id') userId: string, // Recibimos ID por cabecera
  @Headers('user-role') userRole: string, // Recibimos Rol por cabecera
) {
  return this.eventConfigService.getEventCategoriesSummary(id, +userId, userRole);
}

  @Get('event/:id/categories')//sin usar
  getEventCategories(@Param('id', ParseIntPipe) id: number) {
    return this.eventConfigService.getCategoriesByEvent(id);
  }

  //agrega o cambia el status de la modalidad de un evento+categoria: permite enviar la combinación de evento + categoría + modalidad y que el sistema decida si debe crear la fila o simplemente cambiar el estado de is_active
  @Patch('toggle-modality')
  toggleModality(@Body() dto: ToggleModalityDto) {
    return this.eventConfigService.toggleModalityConfig(dto);
  }

  @Get('event/:eventId/category/:categoryId/modalities')
  async getModalities(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.eventConfigService.getModalitiesByEventCategory(eventId, categoryId);
  }

@Patch('toggle-category')
async toggleCategoryInEvent(@Body() dto: ToggleEventCategoryDto) {
  return this.eventConfigService.registerCategoryInEvent(
    dto.event_id, 
    dto.category_id, 
    dto.is_active
  );
}
}