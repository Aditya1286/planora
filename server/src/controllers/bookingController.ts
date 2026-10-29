import { Response } from 'express';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import { TicketType } from '../models/TicketType';
import { PromoCode } from '../models/PromoCode';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';
import { sendDemoEmail } from '../services/emailDemoService';
import { generateIcsContent } from '../services/icsService';

const generateBookingRef = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'PLN-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required to complete booking.' });
      return;
    }

    const { eventId, ticketTypeId, quantity, promoCode: codeString, paymentMethod, attendeeDetails } = req.body;

    const event = await Event.findById(eventId);
    if (!event || event.isDeleted || event.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'Event is not available for booking.' });
      return;
    }

    // Atomic decrement of TicketType inventory
    const ticketType = await TicketType.findOneAndUpdate(
      {
        _id: ticketTypeId,
        eventId,
        remainingQuantity: { $gte: quantity },
        status: 'active',
      },
      {
        $inc: { remainingQuantity: -quantity },
      },
      { new: true }
    );

    if (!ticketType) {
      res.status(400).json({
        success: false,
        message: 'The requested quantity is no longer available. The ticket may be sold out or limited.',
      });
      return;
    }

    // Atomic decrement of overall event capacity
    await Event.findByIdAndUpdate(eventId, {
      $inc: { remainingCapacity: -quantity },
    });

    // Check if ticketType is now sold out
    if (ticketType.remainingQuantity <= 0) {
      await TicketType.findByIdAndUpdate(ticketTypeId, { status: 'sold_out' });
    }

    // Pricing calculation
    const unitPrice = ticketType.price;
    const subtotal = unitPrice * quantity;
    let discountAmount = 0;
    let appliedPromoId: any = null;

    if (codeString && subtotal > 0) {
      const promo = await PromoCode.findOne({
        code: codeString.toUpperCase().trim(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (promo) {
        // Check if universal or specific to this event
        if (!promo.eventId || promo.eventId.toString() === event._id.toString()) {
          if (promo.usedCount < promo.maxUses) {
            if (!promo.minOrderValue || subtotal >= promo.minOrderValue) {
              if (promo.discountType === 'percentage') {
                discountAmount = (subtotal * promo.discountValue) / 100;
                if (promo.maxDiscount && promo.maxDiscount > 0) {
                  discountAmount = Math.min(discountAmount, promo.maxDiscount);
                }
              } else {
                discountAmount = Math.min(promo.discountValue, subtotal);
              }
              appliedPromoId = promo._id;
              await PromoCode.findByIdAndUpdate(promo._id, { $inc: { usedCount: 1 } });
            }
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const bookingReference = generateBookingRef();

    // Generate QR Code data payload
    const qrPayload = JSON.stringify({
      ref: bookingReference,
      eventId: event._id.toString(),
      eventTitle: event.title,
      userId: req.user._id.toString(),
      attendee: attendeeDetails[0]?.name || req.user.name,
      quantity,
      ticketType: ticketType.name,
      generatedAt: new Date().toISOString(),
    });

    const qrCodeData = await QRCode.toDataURL(qrPayload, {
      color: {
        dark: '#1A1A2E',
        light: '#FBF7EE',
      },
      width: 256,
      margin: 1,
    });

    const paymentReference =
      totalAmount === 0 ? 'FREE_TICKET' : `DEMO_PAY_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const booking = await Booking.create({
      bookingReference,
      eventId: event._id,
      userId: req.user._id,
      ticketTypeId: ticketType._id,
      quantity,
      unitPrice,
      subtotal,
      discountAmount,
      promoCodeId: appliedPromoId,
      totalAmount,
      status: 'confirmed',
      paymentStatus: totalAmount === 0 ? 'free' : 'paid',
      paymentMethod: totalAmount === 0 ? 'free' : paymentMethod || 'demo_card',
      paymentReference,
      attendeeDetails,
      qrCodeData,
      checkInStatus: 'not_checked_in',
    });

    // In-app notification
    await Notification.create({
      userId: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your registration for "${event.title}" is confirmed. Ref: ${bookingReference}`,
      type: 'booking_confirmed',
      link: `/bookings/${bookingReference}`,
    });

    // Send demo email
    await sendDemoEmail({
      to: req.user.email,
      subject: `[Planora] Confirmation & Tickets for ${event.title}`,
      template: 'booking_confirmation',
      data: {
        bookingReference,
        eventName: event.title,
        quantity,
        totalAmount,
        startDate: event.startDate,
        attendeeName: attendeeDetails[0]?.name || req.user.name,
      },
    });

    await logAudit({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'BOOKING_CREATED',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      details: { bookingReference, totalAmount, quantity, eventTitle: event.title },
      req,
    });

    const populated = await Booking.findById(booking._id)
      .populate('eventId', 'title slug coverImage startDate endDate timezone format venueId onlineUrl')
      .populate('ticketTypeId', 'name price');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing booking.' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'eventId',
        select: 'title slug coverImage startDate endDate timezone format venueId onlineUrl status',
        populate: {
          path: 'venueId',
          select: 'name city address',
        },
      })
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching bookings.' });
  }
};

export const getBookingByReference = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    const booking = await Booking.findOne({
      bookingReference: reference.toUpperCase(),
    })
      .populate({
        path: 'eventId',
        populate: [
          { path: 'venueId' },
          { path: 'organizerId', select: 'name organization email avatar' },
        ],
      })
      .populate('ticketTypeId')
      .populate('userId', 'name email');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Permission check: owner, event organizer, or admin
    const isOwner = req.user && booking.userId._id.toString() === req.user._id.toString();
    const isOrganizer =
      req.user &&
      (booking.eventId as any).organizerId &&
      (booking.eventId as any).organizerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isOrganizer && !isAdmin) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching booking details.' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(id).populate('eventId');
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    if (
      req.user?.role !== 'admin' &&
      booking.userId.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
      return;
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    // Restore inventory atomically
    await TicketType.findByIdAndUpdate(booking.ticketTypeId, {
      $inc: { remainingQuantity: booking.quantity },
      status: 'active',
    });

    await Event.findByIdAndUpdate(booking.eventId, {
      $inc: { remainingCapacity: booking.quantity },
    });

    // Notify user
    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingReference} has been cancelled.`,
      type: 'event_cancelled',
    });

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      details: { bookingReference: booking.bookingReference },
      req,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Inventory has been restored.',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error cancelling booking.' });
  }
};

export const getEventBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && event.organizerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const bookings = await Booking.find({ eventId })
      .populate('userId', 'name email avatar phone')
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching event bookings.' });
  }
};

export const downloadCalendarIcs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate('venueId');

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const venueName = (event.venueId as any)?.name ? `${(event.venueId as any).name}, ${(event.venueId as any).city}` : undefined;
    const icsString = generateIcsContent(event, venueName);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${event.slug}.ics"`);
    res.send(icsString);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error generating calendar file.' });
  }
};
