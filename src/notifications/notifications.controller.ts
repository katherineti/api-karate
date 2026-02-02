import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Usersesion } from '../auth/strategies/usersesion.decorator';
import { IJwtPayload } from '../auth/dto/jwt-payload.interface';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
    
@Get('my-notifications')
  async getMyNotifications(@Usersesion() user: IJwtPayload) {
    // user.sub contiene el ID del Master en sesión
    const notifications = await this.notificationsService.findByUser(user.sub);
    return {
      count: notifications.length,
      data: notifications,
    };
  }


 @Patch('read-all')
  async readAll(@Usersesion() user: IJwtPayload) {
    return this.notificationsService.markAsRead(user.sub);
  }

  @Patch(':id/read')
  async read(
    @Param('id', ParseIntPipe) id: number,
    @Usersesion() user: IJwtPayload,
  ) {
    return this.notificationsService.markAsRead(user.sub, id);
  }
}