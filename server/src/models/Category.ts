import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  coverImage?: string;
  isFeatured: boolean;
  eventCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Sparkles' },
    color: { type: String, default: '#0047AB' },
    coverImage: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false, index: true },
    eventCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
