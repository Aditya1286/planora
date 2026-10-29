import mongoose, { Document, Schema } from 'mongoose';

export interface ISession {
  _id?: string;
  title: string;
  description: string;
  track?: string;
  startTime: Date;
  endTime: Date;
  speakerNames?: string[];
  location?: string;
}

export interface ISpeaker {
  _id?: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  photo: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface ISponsor {
  _id?: string;
  name: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Community';
  logo: string;
  website?: string;
}

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  venueId?: mongoose.Types.ObjectId;
  format: 'in-person' | 'online' | 'hybrid';
  onlineUrl?: string;
  coverImage: string;
  galleryImages: string[];
  startDate: Date;
  endDate: Date;
  timezone: string;
  capacity: number;
  remainingCapacity: number;
  visibility: 'public' | 'private';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[];
  featured: boolean;
  cancellationReason?: string;
  sessions: ISession[];
  speakers: ISpeaker[];
  sponsors: ISponsor[];
  averageRating: number;
  reviewsCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  track: { type: String, default: 'Main Stage' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  speakerNames: [{ type: String }],
  location: { type: String, default: '' },
});

const SpeakerSchema = new Schema<ISpeaker>({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  company: { type: String, default: '' },
  bio: { type: String, default: '' },
  photo: { type: String, default: '' },
  socialLinks: {
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },
  },
});

const SponsorSchema = new Schema<ISponsor>({
  name: { type: String, required: true },
  tier: {
    type: String,
    enum: ['Platinum', 'Gold', 'Silver', 'Community'],
    default: 'Gold',
  },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
});

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, default: '' },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', index: true },
    format: {
      type: String,
      enum: ['in-person', 'online', 'hybrid'],
      required: true,
      default: 'in-person',
      index: true,
    },
    onlineUrl: { type: String, default: '' },
    coverImage: { type: String, required: true },
    galleryImages: [{ type: String }],
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    capacity: { type: Number, required: true, min: 1 },
    remainingCapacity: { type: Number, required: true, min: 0 },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
      index: true,
    },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false, index: true },
    cancellationReason: { type: String, default: '' },
    sessions: [SessionSchema],
    speakers: [SpeakerSchema],
    sponsors: [SponsorSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ organizerId: 1, status: 1 });
EventSchema.index({ categoryId: 1, status: 1 });
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
