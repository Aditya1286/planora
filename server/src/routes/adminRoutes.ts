import { Router } from 'express';
import {
  getAllUsers,
  updateUserStatusOrRole,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatusOrRole);
router.get('/audit-logs', getAuditLogs);

export default router;
