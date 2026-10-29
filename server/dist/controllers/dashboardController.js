"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendeeDashboard = exports.getAdminAnalytics = exports.getOrganizerAnalytics = void 0;
const Event_1 = require("../models/Event");
const Booking_1 = require("../models/Booking");
const User_1 = require("../models/User");
const Category_1 = require("../models/Category");
const Favorite_1 = require("../models/Favorite");
const AuditLog_1 = require("../models/AuditLog");
const getOrganizerAnalytics = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const organizerId = req.user._id;
        // Get organizer's events
        const myEvents = await Event_1.Event.find({ organizerId, isDeleted: false });
        const eventIds = myEvents.map((e) => e._id);
        // Total gross stats
        const grossStats = await Booking_1.Booking.aggregate([
            { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    ticketsSold: { $sum: '$quantity' },
                    bookingsCount: { $sum: 1 },
                    checkedInCount: {
                        $sum: { $cond: [{ $eq: ['$checkInStatus', 'checked_in'] }, 1, 0] },
                    },
                },
            },
        ]);
        const totals = grossStats[0] || {
            totalRevenue: 0,
            ticketsSold: 0,
            bookingsCount: 0,
            checkedInCount: 0,
        };
        // Revenue & Registrations over time (by month/date)
        const revenueOverTime = await Booking_1.Booking.aggregate([
            { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    tickets: { $sum: '$quantity' },
                    bookings: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
        ]);
        // Tickets sold by type
        const ticketsByType = await Booking_1.Booking.aggregate([
            { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
            {
                $lookup: {
                    from: 'tickettypes',
                    localField: 'ticketTypeId',
                    foreignField: '_id',
                    as: 'ticketTypeInfo',
                },
            },
            { $unwind: '$ticketTypeInfo' },
            {
                $group: {
                    _id: '$ticketTypeInfo.name',
                    count: { $sum: '$quantity' },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { count: -1 } },
        ]);
        // Attendee Demographics by city
        const attendeeDemographics = await Booking_1.Booking.aggregate([
            { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo',
                },
            },
            { $unwind: '$userInfo' },
            {
                $group: {
                    _id: { $ifNull: ['$userInfo.city', 'Online / Unspecified'] },
                    attendees: { $sum: '$quantity' },
                },
            },
            { $sort: { attendees: -1 } },
            { $limit: 8 },
        ]);
        // Top Events
        const topEvents = await Booking_1.Booking.aggregate([
            { $match: { eventId: { $in: eventIds }, status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$eventId',
                    revenue: { $sum: '$totalAmount' },
                    ticketsSold: { $sum: '$quantity' },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'event',
                },
            },
            { $unwind: '$event' },
            {
                $project: {
                    title: '$event.title',
                    slug: '$event.slug',
                    coverImage: '$event.coverImage',
                    startDate: '$event.startDate',
                    revenue: 1,
                    ticketsSold: 1,
                },
            },
        ]);
        // Recent activity feed
        const recentBookings = await Booking_1.Booking.find({ eventId: { $in: eventIds } })
            .populate('userId', 'name email avatar')
            .populate('eventId', 'title')
            .populate('ticketTypeId', 'name')
            .sort({ createdAt: -1 })
            .limit(8);
        const checkInRate = totals.bookingsCount > 0 ? Math.round((totals.checkedInCount / totals.bookingsCount) * 100) : 0;
        res.json({
            success: true,
            data: {
                totals: {
                    totalRevenue: totals.totalRevenue,
                    ticketsSold: totals.ticketsSold,
                    totalEvents: myEvents.length,
                    activeEvents: myEvents.filter((e) => e.status === 'published').length,
                    checkedInCount: totals.checkedInCount,
                    checkInRate,
                },
                revenueOverTime: revenueOverTime.map((r) => ({
                    date: r._id,
                    revenue: r.revenue,
                    tickets: r.tickets,
                })),
                ticketsByType: ticketsByType.map((t) => ({
                    name: t._id,
                    count: t.count,
                    revenue: t.revenue,
                })),
                attendeeDemographics: attendeeDemographics.map((d) => ({
                    city: d._id || 'Global',
                    count: d.attendees,
                })),
                topEvents,
                recentBookings,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching organizer analytics.' });
    }
};
exports.getOrganizerAnalytics = getOrganizerAnalytics;
const getAdminAnalytics = async (_req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments();
        const usersByRole = await User_1.User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        const totalEvents = await Event_1.Event.countDocuments({ isDeleted: false });
        const eventsByStatus = await Event_1.Event.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const grossBookings = await Booking_1.Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    ticketsSold: { $sum: '$quantity' },
                    bookingsCount: { $sum: 1 },
                },
            },
        ]);
        const totals = grossBookings[0] || {
            totalRevenue: 0,
            ticketsSold: 0,
            bookingsCount: 0,
        };
        // User registrations growth (last 6 months / 30 days)
        const userGrowth = await User_1.User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    users: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $limit: 30 },
        ]);
        // Category distribution
        const categoryDistribution = await Category_1.Category.find()
            .select('name eventCount color icon')
            .sort({ eventCount: -1 });
        // Recent platform audit logs
        const recentAuditLogs = await AuditLog_1.AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        res.json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    totalEvents,
                    totalBookings: totals.bookingsCount,
                    totalRevenue: totals.totalRevenue,
                    ticketsSold: totals.ticketsSold,
                },
                usersByRole: usersByRole.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                eventsByStatus: eventsByStatus.reduce((acc, curr) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                userGrowth: userGrowth.map((g) => ({ date: g._id, count: g.users })),
                categoryDistribution,
                recentAuditLogs,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching admin analytics.' });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
const getAttendeeDashboard = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const userId = req.user._id;
        const now = new Date();
        const allBookings = await Booking_1.Booking.find({ userId, status: { $ne: 'cancelled' } })
            .populate({
            path: 'eventId',
            populate: [
                { path: 'venueId', select: 'name city address' },
                { path: 'categoryId', select: 'name color' },
            ],
        })
            .populate('ticketTypeId', 'name price')
            .sort({ createdAt: -1 });
        const upcomingBookings = allBookings.filter((b) => b.eventId && new Date(b.eventId.endDate) >= now);
        const pastBookings = allBookings.filter((b) => b.eventId && new Date(b.eventId.endDate) < now);
        const favorites = await Favorite_1.Favorite.find({ userId })
            .populate({
            path: 'eventId',
            populate: [
                { path: 'venueId', select: 'name city' },
                { path: 'categoryId', select: 'name color' },
            ],
        })
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: {
                stats: {
                    upcomingCount: upcomingBookings.length,
                    pastCount: pastBookings.length,
                    savedCount: favorites.length,
                    totalBookings: allBookings.length,
                },
                upcomingBookings,
                pastBookings,
                favorites: favorites.map((f) => f.eventId).filter(Boolean),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching attendee dashboard.' });
    }
};
exports.getAttendeeDashboard = getAttendeeDashboard;
