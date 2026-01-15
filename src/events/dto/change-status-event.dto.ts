import { IsEnum } from 'class-validator';

export enum EventStatusAction {
  ENABLE = 4,   // 'Evento programado'
  DISABLE = 7,  // 'Evento cancelado'
}

export class ChangeStatusEventDto {
  @IsEnum(EventStatusAction, {
    message: 'El status_id debe ser 4 (Habilitar) o 7 (Inhabilitar)',
  })
  status_id: EventStatusAction;
}