import { Router } from 'express';
import { getVenues, createVenue } from '../controllers/venueController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.get('/', getVenues);
router.post('/', authenticate, authorizeRoles('admin', 'organizer'), createVenue);

export default router;
