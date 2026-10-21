
import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  requestAdminSetupOtp,
  verifyAdminSetupOtp,
  completeAdminSetup,
  requestAdminLoginOtp,
  verifyAdminLoginOtp,
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Customer authentication
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);

// Admin first-time setup
router.post('/admin/setup/send-otp', requestAdminSetupOtp);
router.post('/admin/setup/verify-otp', verifyAdminSetupOtp);
router.post('/admin/setup/set-password', completeAdminSetup);

// Admin login: password first, then OTP
router.post('/admin/login/send-otp', requestAdminLoginOtp);
router.post('/admin/login/verify-otp', verifyAdminLoginOtp);

export default router;
