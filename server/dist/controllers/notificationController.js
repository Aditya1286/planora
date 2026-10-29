"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAnnouncement = exports.markAllAsRead = exports.markAsRead = exports.getMyNotifications = void 0;
const Notification_1 = require("../models/Notification");
const Booking_1 = require("../models/Booking");
const Event_1 = require("../models/Event");
const emailDemoService_1 = require("../services/emailDemoService");
const getMyNotifications = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const notifications = await Notification_1.Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await Notification_1.Notification.countDocuments({
            userId: req.user._id,
            read: false,
        });
        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error fetching notifications.' });
    }
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification_1.Notification.findOneAndUpdate({ _id: id, userId: req.user?._id }, { read: true });
        res.json({ success: true, message: 'Notification marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating notification.' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        await Notification_1.Notification.updateMany({ userId: req.user?._id, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error updating notifications.' });
    }
};
exports.markAllAsRead = markAllAsRead;
const sendAnnouncement = async (req, res) => {
    try {
        const { eventId, title, message } = req.body;
        const event = await Event_1.Event.findById(eventId);
        if (!event) {
            res.status(404).json({ success: false, message: 'Event not found.' });
            return;
        }
        if (req.user?.role !== 'admin' &&
            event.organizerId.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        // Get all registered attendees
        const bookings = await Booking_1.Booking.find({ eventId, status: 'confirmed' }).populate('userId');
        const userIds = Array.from(new Set(bookings.map((b) => b.userId._id.toString())));
        // Create notifications for each unique user
        const notificationsToCreate = userIds.map((uid) => ({
            userId: uid,
            title: `[Announcement] ${event.title}: ${title}`,
            message,
            type: 'announcement',
            link: `/events/${event.slug}`,
        }));
        if (notificationsToCreate.length > 0) {
            await Notification_1.Notification.insertMany(notificationsToCreate);
        }
        // Demo email broadcast
        for (const b of bookings) {
            const email = b.userId?.email;
            if (email) {
                await (0, emailDemoService_1.sendDemoEmail)({
                    to: email,
                    subject: `Announcement for ${event.title}: ${title}`,
                    template: 'announcement',
                    data: { eventName: event.title, message },
                });
            }
        }
        res.json({
            success: true,
            message: `Announcement broadcast to ${userIds.length} attendee(s)!`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error sending announcement.' });
    }
};
exports.sendAnnouncement = sendAnnouncement;
