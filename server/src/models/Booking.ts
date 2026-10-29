import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendeeDetail {
  name: string;
  email: string;
  phone?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingReference: string;
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  ticketTypeId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  promoCodeId?: mongoose.Types.ObjectId;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'free' | 'refunded';
  paymentMethod: 'demo_card' | 'demo_paypal' | 'free';
  paymentReference: string;
  attendeeDetails: IAttendeeDetail[];
  qrCodeData: string;
  checkInStatus: 'not_checked_in' | 'checked_in';
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  waitlisted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttendeeDetailSchema = new Schema<IAttendeeDetail>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
});

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    promoCodeId: { type: Schema.Types.ObjectId, ref: 'PromoCode' },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'refunded'],
      default: 'confirmed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'free', 'refunded'],
      default: 'paid',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['demo_card', 'demo_paypal', 'free'],
      default: 'demo_card',
    },
    paymentReference: { type: String, required: true },
    attendeeDetails: [AttendeeDetailSchema],
    qrCodeData: { type: String, required: true },
    checkInStatus: {
      type: String,
      enum: ['not_checked_in', 'checked_in'],
      default: 'not_checked_in',
      index: true,
    },
    checkedInAt: { type: Date },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, default: '' },
    waitlisted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ eventId: 1, checkInStatus: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
