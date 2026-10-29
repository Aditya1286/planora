import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20 for 20% or 15 for $15
  maxDiscount?: number;
  minOrderValue?: number;
  maxUses: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  eventId?: mongoose.Types.ObjectId; // null means universal
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, default: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  },
  {
    timestamps: true,
  }
);

export const PromoCode = mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);
