import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PG_CONNECTION } from '../../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { eq, and } from 'drizzle-orm';
import { eventsTable, notificationsTable, participantRequestsTable, usersTable } from '../../db/schema';
import { IJwtPayload } from '../../auth/dto/jwt-payload.interface';
import { CreateParticipantRequestDto } from './createParticipantRequest.dto';

@Injectable()
export class ParticipantRequestsService {

  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}
  
  async createParticipantRequest(dto: CreateParticipantRequestDto, master_sender: IJwtPayload) {
    return await this.db.transaction(async (tx) => {
      // 1. Obtener quién es el responsable del evento
      const [event] = await tx
        .select({ creatorId: eventsTable.created_by, name: eventsTable.name })
        .from(eventsTable)
        .where(eq(eventsTable.id, dto.event_id))
        .limit(1);

      if (!event) throw new NotFoundException('Evento no encontrado');

      // 1. Obtener quién es el responsable del evento
      const [data_master_sender] = await tx
        .select({ school_id: usersTable.school_id, name: usersTable.name, lastname: usersTable.lastname, email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, master_sender.sub))
        .limit(1);
      
      if (!data_master_sender) throw new NotFoundException('Responsable del evento no encontrado');
console.log("master que envia la solicitud", data_master_sender);
      // 2. Registrar la solicitud de cupos
      const [request] = await tx.insert(participantRequestsTable).values({
        event_id: dto.event_id,
        master_id: master_sender.sub,
        school_id: data_master_sender.school_id,
        num_participants_requested: dto.num_participants_requested,
        // message: dto.message,
        message: 'Solicitud de '+dto.num_participants_requested+' participantes en el evento '+dto.event_id,
        status: 'pending'
      } as any).returning();

      // 3. Notificar al responsable del evento (Remitente original)
      let name_master_send = data_master_sender.email;
      if(data_master_sender.name && data_master_sender.lastname) {
        name_master_send = data_master_sender.name+' '+data_master_sender.lastname;
      } else {
        name_master_send = data_master_sender.email;
      }

      await tx.insert(notificationsTable).values({
        sender_id: master_sender.sub,        // El Master que pide
        recipient_id: event.creatorId, // El creador del evento 
        event_id: dto.event_id,
        participant_requests_id: request.id,
        title: 'Nueva solicitud de cupos',
        message: `El Master ${name_master_send} solicita ${dto.num_participants_requested} cupos para el evento ${event.name}`,
      } as any);

      return { message: 'Solicitud enviada al responsable del evento', data: request };
    });
  }

// participantRequests.service.ts

async approveRequest(requestId: number, adminId: number) {
  return await this.db.transaction(async (tx) => {
    // 1. Validar existencia y que el que aprueba sea el creador del evento
    const [requestData] = await tx
      .select({
        id: participantRequestsTable.id,
        masterId: participantRequestsTable.master_id,
        eventId: participantRequestsTable.event_id,
        num: participantRequestsTable.num_participants_requested,
        eventName: eventsTable.name
      })
      .from(participantRequestsTable)
      .innerJoin(eventsTable, eq(participantRequestsTable.event_id, eventsTable.id))
      .where(and(
        eq(participantRequestsTable.id, requestId),
        eq(eventsTable.created_by, adminId) // Seguridad: solo el dueño del evento aprueba
      ))
      .limit(1);

    if (!requestData) {
      throw new NotFoundException('Solicitud no encontrada o no tienes permisos sobre este evento');
    }

    // 2. Cambiar estado a 'approved'
    await tx.update(participantRequestsTable)
      .set({ status: 'approved' } as any)
      .where(eq(participantRequestsTable.id, requestId));

    // 3. Notificar al Master que su solicitud fue exitosa
    await tx.insert(notificationsTable).values({
      sender_id: adminId,
      recipient_id: requestData.masterId,
      event_id: requestData.eventId,
      title: '✅ Solicitud de participantes aprobada',
      message: `Tu solicitud para llevar ${requestData.num} participantes al evento "${requestData.eventName}" ha sido APROBADA.`,
    } as any);

    return { message: 'Solicitud aprobada y Master notificado' };
  });
}
}