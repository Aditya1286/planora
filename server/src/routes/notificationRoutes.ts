import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  sendAnnouncement,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.use(authenticate);

router.get('/my', getMyNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.post('/announcement', authorizeRoles('organizer', 'admin'), sendAnnouncement);

export default router;
