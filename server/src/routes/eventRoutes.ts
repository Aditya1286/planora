import { Router } from 'express';
import {
  getEvents,
  getFeaturedEvents,
  getEventBySlugOrId,
  createEvent,
  updateEvent,
  duplicateEvent,
  cancelEvent,
  deleteEvent,
  getOrganizerEvents,
} from '../controllers/eventController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { validateRequest } from '../middleware/validate';
import { createEventSchema, updateEventSchema } from '../validators/eventValidators';

const router = Router();

router.get('/', optionalAuthenticate, getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/organizer/my-events', authenticate, authorizeRoles('organizer', 'admin'), getOrganizerEvents);
router.get('/:identifier', optionalAuthenticate, getEventBySlugOrId);

router.post(
  '/',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  validateRequest(createEventSchema),
  createEvent
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  validateRequest(updateEventSchema),
  updateEvent
);

router.post(
  '/:id/duplicate',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  duplicateEvent
);

router.post(
  '/:id/cancel',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  cancelEvent
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('organizer', 'admin'),
  deleteEvent
);

export default router;
