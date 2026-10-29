import { Response } from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Favorite } from '../models/Favorite';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';

export const getOrganizerAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const organizerId = req.user._id;

    // Get organizer's events
    const myEvents = await Event.find({ organizerId, isDeleted: false });
    const eventIds = myEvents.map((e) => e._id);

    // Total gross stats
    const grossStats = await Booking.aggregate([
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
    const revenueOverTime = await Booking.aggregate([
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
    const ticketsByType = await Booking.aggregate([
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
    const attendeeDemographics = await Booking.aggregate([
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
    const topEvents = await Booking.aggregate([
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
    const recentBookings = await Booking.find({ eventId: { $in: eventIds } })
      .populate('userId', 'name email avatar')
      .populate('eventId', 'title')
      .populate('ticketTypeId', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    const checkInRate =
      totals.bookingsCount > 0 ? Math.round((totals.checkedInCount / totals.bookingsCount) * 100) : 0;

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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching organizer analytics.' });
  }
};

export const getAdminAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalEvents = await Event.countDocuments({ isDeleted: false });
    const eventsByStatus = await Event.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const grossBookings = await Booking.aggregate([
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
    const userGrowth = await User.aggregate([
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
    const categoryDistribution = await Category.find()
      .select('name eventCount color icon')
      .sort({ eventCount: -1 });

    // Recent platform audit logs
    const recentAuditLogs = await AuditLog.find()
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
        usersByRole: usersByRole.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        eventsByStatus: eventsByStatus.reduce((acc: any, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        userGrowth: userGrowth.map((g) => ({ date: g._id, count: g.users })),
        categoryDistribution,
        recentAuditLogs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching admin analytics.' });
  }
};

export const getAttendeeDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userId = req.user._id;
    const now = new Date();

    const allBookings = await Booking.find({ userId, status: { $ne: 'cancelled' } })
      .populate({
        path: 'eventId',
        populate: [
          { path: 'venueId', select: 'name city address' },
          { path: 'categoryId', select: 'name color' },
        ],
      })
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 });

    const upcomingBookings = allBookings.filter(
      (b) => b.eventId && new Date((b.eventId as any).endDate) >= now
    );

    const pastBookings = allBookings.filter(
      (b) => b.eventId && new Date((b.eventId as any).endDate) < now
    );

    const favorites = await Favorite.find({ userId })
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching attendee dashboard.' });
  }
};
