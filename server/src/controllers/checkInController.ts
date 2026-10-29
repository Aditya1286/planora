import { Response } from 'express';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const verifyTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    let searchRef = code.trim();

    // If code is JSON from QR scanner, extract ref
    if (searchRef.startsWith('{')) {
      try {
        const parsed = JSON.parse(searchRef);
        searchRef = parsed.ref || searchRef;
      } catch {
        // use raw
      }
    }

    const booking = await Booking.findOne({
      bookingReference: searchRef.toUpperCase(),
    })
      .populate('eventId', 'title organizerId startDate endDate venueId format')
      .populate('ticketTypeId', 'name price')
      .populate('userId', 'name email avatar phone');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Invalid ticket or booking reference. No record found.',
      });
      return;
    }

    // Verify organizer owns this event or admin
    const event = booking.eventId as any;
    if (
      req.user?.role !== 'admin' &&
      event.organizerId.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to check in attendees for this event.',
      });
      return;
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error verifying ticket.' });
  }
};

export const checkInAttendee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    let searchRef = code.trim();

    if (searchRef.startsWith('{')) {
      try {
        const parsed = JSON.parse(searchRef);
        searchRef = parsed.ref || searchRef;
      } catch {
        // ignore
      }
    }

    const booking = await Booking.findOne({
      bookingReference: searchRef.toUpperCase(),
    })
      .populate('eventId', 'title organizerId')
      .populate('ticketTypeId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Ticket not found. Please double check the booking reference or QR code.',
      });
      return;
    }

    const event = booking.eventId as any;
    if (
      req.user?.role !== 'admin' &&
      event.organizerId.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to check in attendees for this event.',
      });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Cannot check in: This booking was cancelled.',
      });
      return;
    }

    // Prevent duplicate check-in
    if (booking.checkInStatus === 'checked_in') {
      res.status(400).json({
        success: false,
        alreadyCheckedIn: true,
        message: `ALREADY CHECKED IN on ${new Date(booking.checkedInAt!).toLocaleString()}`,
        data: booking,
      });
      return;
    }

    booking.checkInStatus = 'checked_in';
    booking.checkedInAt = new Date();
    booking.checkedInBy = req.user?._id;
    await booking.save();

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'ATTENDEE_CHECKED_IN',
      entityType: 'Booking',
      entityId: booking._id.toString(),
      details: { bookingReference: booking.bookingReference, attendeeName: booking.attendeeDetails[0]?.name },
      req,
    });

    res.json({
      success: true,
      message: 'Attendee successfully checked in!',
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error performing check-in.' });
  }
};

export const getCheckInStats = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const stats = await Booking.aggregate([
      { $match: { eventId: event._id, status: 'confirmed' } },
      {
        $group: {
          _id: '$checkInStatus',
          count: { $sum: 1 },
          ticketsCount: { $sum: '$quantity' },
        },
      },
    ]);

    let checkedIn = 0;
    let notCheckedIn = 0;

    stats.forEach((s) => {
      if (s._id === 'checked_in') checkedIn = s.ticketsCount;
      if (s._id === 'not_checked_in') notCheckedIn = s.ticketsCount;
    });

    const totalTickets = checkedIn + notCheckedIn;
    const rate = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalTickets,
        checkedIn,
        pending: notCheckedIn,
        checkInRate: rate,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching check-in stats.' });
  }
};
