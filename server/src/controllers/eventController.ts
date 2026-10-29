import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Event, IEvent } from '../models/Event';
import { TicketType } from '../models/TicketType';
import { Category } from '../models/Category';
import { Venue } from '../models/Venue';
import { Booking } from '../models/Booking';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';
import { sendDemoEmail } from '../services/emailDemoService';

const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`;
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      format,
      city,
      price,
      status = 'published',
      dateRange,
      sort = 'date_asc',
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isDeleted: false };

    // Status filter
    if (status !== 'all') {
      filter.status = status;
    }

    // Text / Search query
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.categoryId = category;
      } else {
        const catDoc = await Category.findOne({ slug: category });
        if (catDoc) {
          filter.categoryId = catDoc._id;
        }
      }
    }

    // Format filter
    if (format && format !== 'all') {
      filter.format = format;
    }

    // City filter
    if (city && city !== 'all') {
      const venuesInCity = await Venue.find({ city: { $regex: city, $options: 'i' } }).select('_id');
      const venueIds = venuesInCity.map((v) => v._id);
      filter.venueId = { $in: venueIds };
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      filter.startDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateRange === 'this_weekend') {
      const friday = new Date(now);
      friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
      friday.setHours(0, 0, 0, 0);
      const sunday = new Date(friday);
      sunday.setDate(friday.getDate() + 2);
      sunday.setHours(23, 59, 59, 999);
      filter.startDate = { $gte: friday, $lte: sunday };
    } else if (dateRange === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      filter.startDate = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (dateRange === 'upcoming') {
      filter.startDate = { $gte: new Date() };
    } else if (dateRange === 'past') {
      filter.startDate = { $lt: new Date() };
    }

    // Sorting
    let sortQuery: any = { startDate: 1 };
    if (sort === 'date_desc') sortQuery = { startDate: -1 };
    else if (sort === 'popularity') sortQuery = { capacity: -1, averageRating: -1 };
    else if (sort === 'rating') sortQuery = { averageRating: -1, reviewsCount: -1 };

    const totalEvents = await Event.countDocuments(filter);

    const events = await Event.find(filter)
      .populate('categoryId', 'name slug color icon')
      .populate('venueId', 'name city address country')
      .populate('organizerId', 'name avatar organization')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Fetch ticket price ranges for these events
    const eventIds = events.map((e) => e._id);
    const tickets = await TicketType.find({ eventId: { $in: eventIds }, status: { $ne: 'hidden' } }).lean();

    const ticketsByEvent: Record<string, any[]> = {};
    tickets.forEach((t) => {
      const eid = t.eventId.toString();
      if (!ticketsByEvent[eid]) ticketsByEvent[eid] = [];
      ticketsByEvent[eid].push(t);
    });

    let enrichedEvents = events.map((e) => {
      const eventTickets = ticketsByEvent[e._id.toString()] || [];
      const prices = eventTickets.map((t) => t.price);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const isFree = eventTickets.length > 0 && eventTickets.some((t) => t.price === 0);

      return {
        ...e,
        minPrice,
        maxPrice,
        isFree,
        ticketTypes: eventTickets,
      };
    });

    // Price filter ('free' or 'paid')
    if (price === 'free') {
      enrichedEvents = enrichedEvents.filter((e) => e.isFree || e.minPrice === 0);
    } else if (price === 'paid') {
      enrichedEvents = enrichedEvents.filter((e) => e.minPrice > 0);
    }

    // Price sorting if requested
    if (sort === 'price_asc') {
      enrichedEvents.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sort === 'price_desc') {
      enrichedEvents.sort((a, b) => b.maxPrice - a.maxPrice);
    }

    res.json({
      success: true,
      data: {
        events: enrichedEvents,
        pagination: {
          total: totalEvents,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalEvents / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching events.' });
  }
};

export const getFeaturedEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const featured = await Event.find({
      featured: true,
      status: 'published',
      isDeleted: false,
    })
      .populate('categoryId', 'name slug color icon')
      .populate('venueId', 'name city address country')
      .populate('organizerId', 'name avatar organization')
      .sort({ startDate: 1 })
      .limit(6)
      .lean();

    const eventIds = featured.map((e) => e._id);
    const tickets = await TicketType.find({ eventId: { $in: eventIds } }).lean();

    const enriched = featured.map((e) => {
      const eventTickets = tickets.filter((t) => t.eventId.toString() === e._id.toString());
      const prices = eventTickets.map((t) => t.price);
      return {
        ...e,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        isFree: eventTickets.some((t) => t.price === 0),
        ticketTypes: eventTickets,
      };
    });

    res.json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching featured events.' });
  }
};

export const getEventBySlugOrId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier, isDeleted: false }
      : { slug: identifier, isDeleted: false };

    const event = await Event.findOne(query)
      .populate('categoryId', 'name slug description color icon')
      .populate('venueId')
      .populate('organizerId', 'name avatar bio organization website socialLinks')
      .lean();

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const ticketTypes = await TicketType.find({
      eventId: event._id,
      status: { $ne: 'hidden' },
    }).sort({ price: 1 });

    const prices = ticketTypes.map((t) => t.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    // Get related events in same category
    const relatedEvents = await Event.find({
      categoryId: event.categoryId,
      _id: { $ne: event._id },
      status: 'published',
      isDeleted: false,
    })
      .select('title slug coverImage startDate format averageRating capacity')
      .populate('venueId', 'city name')
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: {
        ...event,
        ticketTypes,
        minPrice,
        maxPrice,
        isFree: ticketTypes.some((t) => t.price === 0),
        relatedEvents,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching event details.' });
  }
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      shortDescription,
      description,
      categoryId,
      venueId,
      format,
      onlineUrl,
      coverImage,
      galleryImages,
      startDate,
      endDate,
      timezone,
      capacity,
      visibility,
      status = 'published',
      tags,
      featured = false,
      sessions = [],
      speakers = [],
      sponsors = [],
      ticketTypes = [],
    } = req.body;

    const slug = generateSlug(title);

    const event = await Event.create({
      title,
      slug,
      shortDescription,
      description,
      categoryId,
      organizerId: req.user._id,
      venueId: venueId || null,
      format,
      onlineUrl: onlineUrl || '',
      coverImage,
      galleryImages: galleryImages || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      timezone: timezone || 'UTC',
      capacity,
      remainingCapacity: capacity,
      visibility: visibility || 'public',
      status,
      tags: tags || [],
      featured: req.user.role === 'admin' ? featured : false,
      sessions,
      speakers,
      sponsors,
    });

    // Create ticket types
    if (ticketTypes.length > 0) {
      const createdTickets = ticketTypes.map((tt: any) => ({
        eventId: event._id,
        name: tt.name,
        description: tt.description || '',
        price: tt.price || 0,
        totalQuantity: tt.totalQuantity,
        remainingQuantity: tt.totalQuantity,
        perUserLimit: tt.perUserLimit || 5,
        salesStart: tt.salesStart ? new Date(tt.salesStart) : new Date(startDate),
        salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : new Date(endDate),
        status: tt.status || 'active',
      }));
      await TicketType.insertMany(createdTickets);
    }

    // Increment category event count
    await Category.findByIdAndUpdate(categoryId, { $inc: { eventCount: 1 } });

    await logAudit({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: event._id.toString(),
      details: { title: event.title, capacity },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating event.' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event || event.isDeleted) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && event.organizerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not own this event.' });
      return;
    }

    const { ticketTypes, ...eventUpdates } = req.body;

    if (eventUpdates.startDate) eventUpdates.startDate = new Date(eventUpdates.startDate);
    if (eventUpdates.endDate) eventUpdates.endDate = new Date(eventUpdates.endDate);

    Object.assign(event, eventUpdates);
    await event.save();

    // Update / create ticket types if provided
    if (ticketTypes && Array.isArray(ticketTypes)) {
      for (const tt of ticketTypes) {
        if (tt._id && mongoose.Types.ObjectId.isValid(tt._id)) {
          await TicketType.findByIdAndUpdate(tt._id, {
            name: tt.name,
            description: tt.description,
            price: tt.price,
            totalQuantity: tt.totalQuantity,
            perUserLimit: tt.perUserLimit,
            status: tt.status,
          });
        } else {
          await TicketType.create({
            eventId: event._id,
            name: tt.name,
            description: tt.description || '',
            price: tt.price || 0,
            totalQuantity: tt.totalQuantity,
            remainingQuantity: tt.totalQuantity,
            perUserLimit: tt.perUserLimit || 5,
            salesStart: tt.salesStart ? new Date(tt.salesStart) : event.startDate,
            salesEnd: tt.salesEnd ? new Date(tt.salesEnd) : event.endDate,
            status: tt.status || 'active',
          });
        }
      }
    }

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'EVENT_UPDATED',
      entityType: 'Event',
      entityId: event._id.toString(),
      details: { updates: Object.keys(eventUpdates) },
      req,
    });

    res.json({
      success: true,
      message: 'Event updated successfully.',
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating event.' });
  }
};

export const duplicateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const original = await Event.findById(id);

    if (!original || original.isDeleted) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && original.organizerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not own this event.' });
      return;
    }

    const newTitle = `Copy of ${original.title}`;
    const newSlug = generateSlug(newTitle);

    const duplicated = await Event.create({
      title: newTitle,
      slug: newSlug,
      shortDescription: original.shortDescription,
      description: original.description,
      categoryId: original.categoryId,
      organizerId: req.user._id,
      venueId: original.venueId,
      format: original.format,
      onlineUrl: original.onlineUrl,
      coverImage: original.coverImage,
      galleryImages: original.galleryImages,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks ahead
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      timezone: original.timezone,
      capacity: original.capacity,
      remainingCapacity: original.capacity,
      visibility: 'public',
      status: 'draft',
      tags: original.tags,
      sessions: original.sessions,
      speakers: original.speakers,
      sponsors: original.sponsors,
    });

    // Duplicate ticket types
    const originalTickets = await TicketType.find({ eventId: original._id });
    if (originalTickets.length > 0) {
      const newTickets = originalTickets.map((t) => ({
        eventId: duplicated._id,
        name: t.name,
        description: t.description,
        price: t.price,
        totalQuantity: t.totalQuantity,
        remainingQuantity: t.totalQuantity,
        perUserLimit: t.perUserLimit,
        salesStart: duplicated.startDate,
        salesEnd: duplicated.endDate,
        status: 'active',
      }));
      await TicketType.insertMany(newTickets);
    }

    await logAudit({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'EVENT_DUPLICATED',
      entityType: 'Event',
      entityId: duplicated._id.toString(),
      details: { sourceEventId: original._id },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Event duplicated successfully as draft.',
      data: duplicated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error duplicating event.' });
  }
};

export const cancelEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    const event = await Event.findById(id);

    if (!event || event.isDeleted) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && event.organizerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    event.status = 'cancelled';
    event.cancellationReason = cancellationReason || 'Event cancelled by organizer.';
    await event.save();

    // Cancel all confirmed bookings
    const confirmedBookings = await Booking.find({ eventId: event._id, status: 'confirmed' }).populate('userId');

    for (const b of confirmedBookings) {
      b.status = 'cancelled';
      b.cancellationReason = event.cancellationReason;
      await b.save();

      // Notify attendee
      await Notification.create({
        userId: b.userId._id,
        title: `Event Cancelled: ${event.title}`,
        message: `Unfortunately, the event "${event.title}" has been cancelled. Reason: ${event.cancellationReason}. If applicable, any payments have been refunded.`,
        type: 'event_cancelled',
        link: `/events/${event.slug}`,
      });

      // Send demo email
      await sendDemoEmail({
        to: (b.userId as any).email,
        subject: `[Planora] Event Cancellation Notice: ${event.title}`,
        template: 'cancellation',
        data: {
          eventName: event.title,
          bookingReference: b.bookingReference,
          cancellationReason: event.cancellationReason,
        },
      });
    }

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'EVENT_CANCELLED',
      entityType: 'Event',
      entityId: event._id.toString(),
      details: { affectedBookingsCount: confirmedBookings.length, cancellationReason },
      req,
    });

    res.json({
      success: true,
      message: `Event has been cancelled. ${confirmedBookings.length} attendee(s) have been notified.`,
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error cancelling event.' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event || event.isDeleted) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (req.user?.role !== 'admin' && event.organizerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    // Soft delete
    event.isDeleted = true;
    await event.save();

    // Decrement category count
    await Category.findByIdAndUpdate(event.categoryId, { $inc: { eventCount: -1 } });

    await logAudit({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'EVENT_DELETED',
      entityType: 'Event',
      entityId: event._id.toString(),
      req,
    });

    res.json({ success: true, message: 'Event archived/deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting event.' });
  }
};

export const getOrganizerEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const events = await Event.find({ organizerId: req.user._id, isDeleted: false })
      .populate('categoryId', 'name')
      .populate('venueId', 'name city')
      .sort({ createdAt: -1 })
      .lean();

    const eventIds = events.map((e) => e._id);

    // Aggregate bookings for these events
    const bookingStats = await Booking.aggregate([
      { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$eventId',
          totalRevenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: '$quantity' },
          bookingsCount: { $sum: 1 },
          checkedInCount: {
            $sum: { $cond: [{ $eq: ['$checkInStatus', 'checked_in'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap: Record<string, any> = {};
    bookingStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enriched = events.map((e) => {
      const stat = statsMap[e._id.toString()] || {
        totalRevenue: 0,
        ticketsSold: 0,
        bookingsCount: 0,
        checkedInCount: 0,
      };
      return {
        ...e,
        stats: stat,
      };
    });

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching organizer events.' });
  }
};
