import mongoose, { Document, Schema } from 'mongoose';

export interface IVenue extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  contactEmail?: string;
  contactPhone?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VenueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, default: '' },
    country: { type: String, required: true },
    postalCode: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    amenities: [{ type: String }],
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    photos: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

VenueSchema.index({ city: 1, name: 1 });

export const Venue = mongoose.model<IVenue>('Venue', VenueSchema);
