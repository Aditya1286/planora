import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingByReference,
  cancelBooking,
  getEventBookings,
  downloadCalendarIcs,
} from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { validateRequest } from '../middleware/validate';
import { createBookingSchema, cancelBookingSchema } from '../validators/bookingValidators';

const router = Router();

router.post('/', authenticate, validateRequest(createBookingSchema), createBooking);
router.get('/my', authenticate, getMyBookings);
router.get('/reference/:reference', authenticate, getBookingByReference);
router.post('/:id/cancel', authenticate, validateRequest(cancelBookingSchema), cancelBooking);
router.get('/event/:eventId', authenticate, authorizeRoles('organizer', 'admin'), getEventBookings);
router.get('/event/:eventId/calendar.ics', downloadCalendarIcs);

export default router;
