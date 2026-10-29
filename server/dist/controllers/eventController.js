"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizerEvents = exports.deleteEvent = exports.cancelEvent = exports.duplicateEvent = exports.updateEvent = exports.createEvent = exports.getEventBySlugOrId = exports.getFeaturedEvents = exports.getEvents = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Event_1 = require("../models/Event");
const TicketType_1 = require("../models/TicketType");
const Category_1 = require("../models/Category");
const Venue_1 = require("../models/Venue");
const Booking_1 = require("../models/Booking");
const Notification_1 = require("../models/Notification");
const auditService_1 = require("../services/auditService");
const emailDemoService_1 = require("../services/emailDemoService");
const generateSlug = (title) => {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${baseSlug}-${randomSuffix}`;
};
const getEvents = async (req, res) => {
    try {
        const { search, category, format, city, price, status = 'published', dateRange, sort = 'date_asc', page = '1', limit = '12', } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const skip = (pageNum - 1) * limitNum;
        const filter = { isDeleted: false };
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
            if (mongoose_1.default.Types.ObjectId.isValid(category)) {
                filter.categoryId = category;
            }
            else {
                const catDoc = await Category_1.Category.findOne({ slug: category });
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
            const venuesInCity = await Venue_1.Venue.find({ city: { $regex: city, $options: 'i' } }).select('_id');
            const venueIds = venuesInCity.map((v) => v._id);
            filter.venueId = { $in: venueIds };
        }
        // Date range filter
        const now = new Date();
        if (dateRange === 'today') {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));
            filter.startDate = { $gte: startOfDay, $lte: endOfDay };
        }
        else if (dateRange === 'this_weekend') {
            const friday = new Date(now);
            friday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
            friday.setHours(0, 0, 0, 0);
            const sunday = new Date(friday);
            sunday.setDate(friday.getDate() + 2);
            sunday.setHours(23, 59, 59, 999);
            filter.startDate = { $gte: friday, $lte: sunday };
        }
        else if (dateRange === 'this_month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            filter.startDate = { $gte: startOfMonth, $lte: endOfMonth };
        }
        else if (dateRange === 'upcoming') {
            filter.startDate = { $gte: new Date() };
        }
        else if (dateRange === 'past') {
            filter.startDate = { $lt: new Date() };
        }
        // Sorting
        let sortQuery = { startDate: 1 };
        if (sort === 'date_desc')
            sortQuery = { startDate: -1 };
        else if (sort === 'popularity')
            sortQuery = { capacity: -1, averageRating: -1 };
        else if (sort === 'rating')
            sortQuery = { averageRating: -1, reviewsCount: -1 };
        const totalEvents = await Event_1.Event.countDocuments(filter);
        const events = await Event_1.Event.find(filter)
            .populate('categoryId', 'name slug color icon')
            .populate('venueId', 'name city address country')
            .populate('organizerId', 'name avatar organization')
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum)
            .lean();
        // Fetch ticket price ranges for these events
        const eventIds = events.map((e) => e._id);
        const tickets = await TicketType_1.TicketType.find({ eventId: { $in: eventIds }, status: { $ne: 'hidden' } }).lean();
        const ticketsByEvent = {};
        tickets.forEach((t) => {
            const eid = t.eventId.toString();
            if (!ticketsByEvent[eid])
                ticketsByEvent[eid] = [];
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
        }
        else if (price === 'paid') {
            enrichedEvents = enrichedEvents.filter((e) => e.minPrice > 0);
        }
        // Price sorting if requested
        if (sort === 'price_asc') {
            enrichedEvents.sort((a, b) => a.minPrice - b.minPrice);
        }
        else if (sort === 'price_desc') {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching events.' });
    }
};
exports.getEvents = getEvents;
const getFeaturedEvents = async (_req, res) => {
    try {
        const featured = await Event_1.Event.find({
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
        const tickets = await TicketType_1.TicketType.find({ eventId: { $in: eventIds } }).lean();
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching featured events.' });
    }
};
exports.getFeaturedEvents = getFeaturedEvents;
const getEventBySlugOrId = async (req, res) => {
    try {
        const { identifier } = req.params;
        const query = mongoose_1.default.Types.ObjectId.isValid(identifier)
            ? { _id: identifier, isDeleted: false }
            : { slug: identifier, isDeleted: false };
        const event = await Event_1.Event.findOne(query)
            .populate('categoryId', 'name slug description color icon')
            .populate('venueId')
            .populate('organizerId', 'name avatar bio organization website socialLinks')
            .lean();
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found.' });
            return;
        }
        const ticketTypes = await TicketType_1.TicketType.find({
            eventId: event._id,
            status: { $ne: 'hidden' },
        }).sort({ price: 1 });
        const prices = ticketTypes.map((t) => t.price);
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        // Get related events in same category
        const relatedEvents = await Event_1.Event.find({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching event details.' });
    }
};
exports.getEventBySlugOrId = getEventBySlugOrId;
const createEvent = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const { title, shortDescription, description, categoryId, venueId, format, onlineUrl, coverImage, galleryImages, startDate, endDate, timezone, capacity, visibility, status = 'published', tags, featured = false, sessions = [], speakers = [], sponsors = [], ticketTypes = [], } = req.body;
        const slug = generateSlug(title);
        const event = await Event_1.Event.create({
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
            const createdTickets = ticketTypes.map((tt) => ({
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
            await TicketType_1.TicketType.insertMany(createdTickets);
        }
        // Increment category event count
        await Category_1.Category.findByIdAndUpdate(categoryId, { $inc: { eventCount: 1 } });
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error creating event.' });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.Event.findById(id);
        if (!event || event.isDeleted) {
            res.status(404).json({ success: false, message: 'Event not found.' });
            return;
        }
        if (req.user?.role !== 'admin' && event.organizerId.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Forbidden: You do not own this event.' });
            return;
        }
        const { ticketTypes, ...eventUpdates } = req.body;
        if (eventUpdates.startDate)
            eventUpdates.startDate = new Date(eventUpdates.startDate);
        if (eventUpdates.endDate)
            eventUpdates.endDate = new Date(eventUpdates.endDate);
        Object.assign(event, eventUpdates);
        await event.save();
        // Update / create ticket types if provided
        if (ticketTypes && Array.isArray(ticketTypes)) {
            for (const tt of ticketTypes) {
                if (tt._id && mongoose_1.default.Types.ObjectId.isValid(tt._id)) {
                    await TicketType_1.TicketType.findByIdAndUpdate(tt._id, {
                        name: tt.name,
                        description: tt.description,
                        price: tt.price,
                        totalQuantity: tt.totalQuantity,
                        perUserLimit: tt.perUserLimit,
                        status: tt.status,
                    });
                }
                else {
                    await TicketType_1.TicketType.create({
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
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating event.' });
    }
};
exports.updateEvent = updateEvent;
const duplicateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const original = await Event_1.Event.findById(id);
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
        const duplicated = await Event_1.Event.create({
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
        const originalTickets = await TicketType_1.TicketType.find({ eventId: original._id });
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
            await TicketType_1.TicketType.insertMany(newTickets);
        }
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error duplicating event.' });
    }
};
exports.duplicateEvent = duplicateEvent;
const cancelEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;
        const event = await Event_1.Event.findById(id);
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
        const confirmedBookings = await Booking_1.Booking.find({ eventId: event._id, status: 'confirmed' }).populate('userId');
        for (const b of confirmedBookings) {
            b.status = 'cancelled';
            b.cancellationReason = event.cancellationReason;
            await b.save();
            // Notify attendee
            await Notification_1.Notification.create({
                userId: b.userId._id,
                title: `Event Cancelled: ${event.title}`,
                message: `Unfortunately, the event "${event.title}" has been cancelled. Reason: ${event.cancellationReason}. If applicable, any payments have been refunded.`,
                type: 'event_cancelled',
                link: `/events/${event.slug}`,
            });
            // Send demo email
            await (0, emailDemoService_1.sendDemoEmail)({
                to: b.userId.email,
                subject: `[Planora] Event Cancellation Notice: ${event.title}`,
                template: 'cancellation',
                data: {
                    eventName: event.title,
                    bookingReference: b.bookingReference,
                    cancellationReason: event.cancellationReason,
                },
            });
        }
        await (0, auditService_1.logAudit)({
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error cancelling event.' });
    }
};
exports.cancelEvent = cancelEvent;
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.Event.findById(id);
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
        await Category_1.Category.findByIdAndUpdate(event.categoryId, { $inc: { eventCount: -1 } });
        await (0, auditService_1.logAudit)({
            userId: req.user?._id,
            userEmail: req.user?.email,
            action: 'EVENT_DELETED',
            entityType: 'Event',
            entityId: event._id.toString(),
            req,
        });
        res.json({ success: true, message: 'Event archived/deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error deleting event.' });
    }
};
exports.deleteEvent = deleteEvent;
const getOrganizerEvents = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const events = await Event_1.Event.find({ organizerId: req.user._id, isDeleted: false })
            .populate('categoryId', 'name')
            .populate('venueId', 'name city')
            .sort({ createdAt: -1 })
            .lean();
        const eventIds = events.map((e) => e._id);
        // Aggregate bookings for these events
        const bookingStats = await Booking_1.Booking.aggregate([
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
        const statsMap = {};
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching organizer events.' });
    }
};
exports.getOrganizerEvents = getOrganizerEvents;
