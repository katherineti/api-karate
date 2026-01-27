import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { notificationsTable } from '../db/schema';
import { and, eq, desc } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  constructor(@Inject(PG_CONNECTION) private readonly db: NeonDatabase) {}

  async findByUser(userId: number) {
    return await this.db
      .select()
      .from(notificationsTable)
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