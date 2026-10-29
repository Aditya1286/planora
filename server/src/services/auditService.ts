import { Request } from 'express';
import { AuditLog } from '../models';
import mongoose from 'mongoose';

export interface AuditParams {
  userId?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  action: string;
  entityType: 'User' | 'Event' | 'Booking' | 'TicketType' | 'Category' | 'Venue' | 'System';
  entityId?: string;
  details?: Record<string, any>;
  req?: Request;
}

export const logAudit = async (params: AuditParams): Promise<void> => {
  try {
    const ipAddress = params.req ? (params.req.headers['x-forwarded-for'] as string) || params.req.ip || '' : '';
    const userAgent = params.req ? params.req.headers['user-agent'] || '' : '';

    await AuditLog.create({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details || {},
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error);
  }
};
