import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  organizerReply?: {
    comment: string;
    repliedAt: Date;
    repliedBy: mongoose.Types.ObjectId;
  };
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true },
    comment: { type: String, required: true },
    organizerReply: {
      comment: { type: String, default: '' },
      repliedAt: { type: Date },
      repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    isApproved: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
