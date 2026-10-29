import { Router } from 'express';
import {
  verifyTicket,
  checkInAttendee,
  getCheckInStats,
} from '../controllers/checkInController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { validateRequest } from '../middleware/validate';
import { checkInSchema } from '../validators/bookingValidators';

const router = Router();

router.use(authenticate, authorizeRoles('organizer', 'admin'));

router.post('/verify', validateRequest(checkInSchema), verifyTicket);
router.post('/check-in', validateRequest(checkInSchema), checkInAttendee);
router.get('/stats/:eventId', getCheckInStats);

export default router;
