import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Event } from '../models/Event';
import { Booking } from '../models/Booking';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditService';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { eventId, rating, title, comment } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    // Check if user attended or booked this event
    const booking = await Booking.findOne({
      eventId,
      userId: req.user._id,
      status: 'confirmed',
    });

    if (!booking && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only registered attendees who have booked tickets for this event can leave a review.',
      });
      return;
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ eventId, userId: req.user._id });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this event.',
      });
      return;
    }

    const review = await Review.create({
      eventId,
      userId: req.user._id,
      bookingId: booking?._id,
      rating: Number(rating),
      title,
      comment,
      isApproved: true,
    });

    // Recalculate average rating for the event
    const reviews = await Review.find({ eventId, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    event.averageRating = averageRating;
    event.reviewsCount = reviews.length;
    await event.save();

    await logAudit({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'REVIEW_SUBMITTED',
      entityType: 'Event',
      entityId: eventId,
      details: { rating, title },
      req,
    });

    const populated = await Review.findById(review._id).populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error submitting review.' });
  }
};

export const getEventReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const reviews = await Review.find({ eventId, isApproved: true })
      .populate('userId', 'name avatar')
      .populate('organizerReply.repliedBy', 'name avatar organization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching reviews.' });
  }
};

export const replyToReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId).populate('eventId');
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const event = review.eventId as any;
    if (
      req.user.role !== 'admin' &&
      event.organizerId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden: Only the event organizer can reply.' });
      return;
    }

    review.organizerReply = {
      comment,
      repliedAt: new Date(),
      repliedBy: req.user._id,
    };
    await review.save();

    res.json({
      success: true,
      message: 'Reply posted successfully.',
      data: review,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error replying to review.' });
  }
};
