import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPasswordDemo,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/authValidators';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.put('/change-password', authenticate, validateRequest(changePasswordSchema), changePassword);
router.post('/forgot-password', forgotPasswordDemo);

export default router;
