import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().min(1, 'Event ID is required'),
    ticketTypeId: z.string().min(1, 'Ticket type ID is required'),
    quantity: z.number().int().min(1).max(10, 'Maximum 10 tickets per order'),
    promoCode: z.string().optional(),
    paymentMethod: z.enum(['demo_card', 'demo_paypal', 'free']).default('demo_card'),
    attendeeDetails: z
      .array(
        z.object({
          name: z.string().min(2, 'Attendee name is required'),
          email: z.string().email('Attendee valid email is required'),
          phone: z.string().optional(),
        })
      )
      .min(1, 'At least one attendee detail is required'),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    cancellationReason: z.string().optional().default('Cancelled by user'),
  }),
});

export const checkInSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Booking reference or QR code payload is required'),
  }),
});
