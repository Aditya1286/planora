import mongoose, { Document, Schema } from 'mongoose';

export interface IWaitlist extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  ticketTypeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  status: 'waiting' | 'notified' | 'converted' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'converted', 'expired'],
      default: 'waiting',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

WaitlistSchema.index({ eventId: 1, userId: 1, ticketTypeId: 1 }, { unique: true });

export const Waitlist = mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
