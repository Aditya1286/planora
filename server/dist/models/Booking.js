"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AttendeeDetailSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
});
const BookingSchema = new mongoose_1.Schema({
    bookingReference: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
    },
    eventId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticketTypeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TicketType', required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    promoCodeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PromoCode' },
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
    checkedInBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, default: '' },
    waitlisted: { type: Boolean, default: false },
}, {
    timestamps: true,
});
BookingSchema.index({ eventId: 1, checkInStatus: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ createdAt: -1 });
exports.Booking = mongoose_1.default.model('Booking', BookingSchema);
