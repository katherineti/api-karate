import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { notificationsTable, participantRequestsTable } from '../db/schema';
import { and, eq, desc } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

  async findByUser(userId: number) {
    return await this.db
      .select({
      // Datos de la notificación
      id: notificationsTable.id,
      sender_id: notificationsTable.sender_id,
      recipient_id: notificationsTable.recipient_id,
      event_id: notificationsTable.event_id,
      title: notificationsTable.title,
      message: notificationsTable.message,
      is_read: notificationsTable.is_read,
      created_at: notificationsTable.created_at,
      participant_request_id: notificationsTable.participant_requests_id,
      // Datos de la solicitud (vienen del Join)
      participant_request_status: participantRequestsTable.status,
      num_participants_requested: participantRequestsTable.num_participants_requested
    })
      .from(notificationsTable)
      .leftJoin(
        participantRequestsTable, 
        eq(notificationsTable.participant_requests_id, participantRequestsTable.id)
        )
      .where(eq(notificationsTable.recipient_id, userId))
      .orderBy(desc(notificationsTable.created_at)); // Las más recientes primero
  }

  async markAsRead(notificationId: number, userId: number) {
    return await this.db
      .update(notificationsTable)
      .set({ is_read: true } as any)
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.recipient_id, userId) // Seguridad: solo el dueño puede marcarla
        )
      )
      .returning();
  }
}