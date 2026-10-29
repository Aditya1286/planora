"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInSchema = exports.cancelBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().min(1, 'Event ID is required'),
        ticketTypeId: zod_1.z.string().min(1, 'Ticket type ID is required'),
        quantity: zod_1.z.number().int().min(1).max(10, 'Maximum 10 tickets per order'),
        promoCode: zod_1.z.string().optional(),
        paymentMethod: zod_1.z.enum(['demo_card', 'demo_paypal', 'free']).default('demo_card'),
        attendeeDetails: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().min(2, 'Attendee name is required'),
            email: zod_1.z.string().email('Attendee valid email is required'),
            phone: zod_1.z.string().optional(),
        }))
            .min(1, 'At least one attendee detail is required'),
    }),
});
exports.cancelBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        cancellationReason: zod_1.z.string().optional().default('Cancelled by user'),
    }),
});
exports.checkInSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z.string().min(3, 'Booking reference or QR code payload is required'),
    }),
});
