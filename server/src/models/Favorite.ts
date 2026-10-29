import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FavoriteSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
