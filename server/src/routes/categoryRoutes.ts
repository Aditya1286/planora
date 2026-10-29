import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, authorizeRoles('admin'), createCategory);

export default router;
