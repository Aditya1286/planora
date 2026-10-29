import { Router } from 'express';
import { createReview, getEventReviews, replyToReview } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';

const router = Router();

router.get('/event/:eventId', getEventReviews);
router.post('/', authenticate, createReview);
router.post('/:reviewId/reply', authenticate, authorizeRoles('organizer', 'admin'), replyToReview);

export default router;
