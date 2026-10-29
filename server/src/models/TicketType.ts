import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketType extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  name: string; // 'Free', 'General Admission', 'VIP Pass', 'Early Bird', etc.
  description: string;
  price: number; // 0 for free
  totalQuantity: number;
  remainingQuantity: number;
  perUserLimit: number;
  salesStart: Date;
  salesEnd: Date;
  status: 'active' | 'sold_out' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, default: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    remainingQuantity: { type: Number, required: true, min: 0 },
    perUserLimit: { type: Number, default: 5, min: 1 },
    salesStart: { type: Date, required: true },
    salesEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'sold_out', 'hidden'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

TicketTypeSchema.index({ eventId: 1, status: 1 });

export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
