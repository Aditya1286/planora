import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  entityType: 'User' | 'Event' | 'Booking' | 'TicketType' | 'Category' | 'Venue' | 'System';
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: { type: String, default: '' },
    action: { type: String, required: true, index: true },
    entityType: {
      type: String,
      enum: ['User', 'Event', 'Booking', 'TicketType', 'Category', 'Venue', 'System'],
      required: true,
      index: true,
    },
    entityId: { type: String, default: '' },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
