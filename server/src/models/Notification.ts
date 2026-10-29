import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'event_updated' | 'event_cancelled' | 'reminder' | 'announcement' | 'system';
  link?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking_confirmed', 'event_updated', 'event_cancelled', 'reminder', 'announcement', 'system'],
      default: 'system',
      index: true,
    },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
