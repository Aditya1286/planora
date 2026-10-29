import { Response } from 'express';
import { Notification } from '../models/Notification';
import { Booking } from '../models/Booking';
import { Event } from '../models/Event';
import { AuthRequest } from '../middleware/auth';
import { sendDemoEmail } from '../services/emailDemoService';

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching notifications.' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?._id },
      { read: true }
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notification.' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user?._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating notifications.' });
  }
};

export const sendAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId, title, message } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    if (
      req.user?.role !== 'admin' &&
      event.organizerId.toString() !== req.user?._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    // Get all registered attendees
    const bookings = await Booking.find({ eventId, status: 'confirmed' }).populate('userId');
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
      await Notification.insertMany(notificationsToCreate);
    }

    // Demo email broadcast
    for (const b of bookings) {
      const email = (b.userId as any)?.email;
      if (email) {
        await sendDemoEmail({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error sending announcement.' });
  }
};
