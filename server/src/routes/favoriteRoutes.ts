import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/toggle', toggleFavorite);
router.get('/my', getMyFavorites);

export default router;
