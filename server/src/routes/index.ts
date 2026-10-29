import { Router } from 'express';
import authRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import bookingRoutes from './bookingRoutes';
import checkInRoutes from './checkInRoutes';
import dashboardRoutes from './dashboardRoutes';
import reviewRoutes from './reviewRoutes';
import favoriteRoutes from './favoriteRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import categoryRoutes from './categoryRoutes';
import venueRoutes from './venueRoutes';
import promoCodeRoutes from './promoCodeRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/check-in', checkInRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reviews', reviewRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/venues', venueRoutes);
router.use('/promo-codes', promoCodeRoutes);

export default router;
