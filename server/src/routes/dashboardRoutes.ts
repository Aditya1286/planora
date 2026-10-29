import { Router } from 'express';
import {
  getOrganizerAnalytics,
  getAdminAnalytics,
  getAttendeeDashboard,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.get('/organizer', authenticate, authorizeRoles('organizer', 'admin'), getOrganizerAnalytics);
router.get('/admin', authenticate, authorizeRoles('admin'), getAdminAnalytics);
router.get('/attendee', authenticate, getAttendeeDashboard);

export default router;
