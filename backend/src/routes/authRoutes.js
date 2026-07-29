import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getSystemSettings,
  updateSystemSettings,
  updateFcmToken
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshTokenUser);
router.post('/fcm-token', protect, updateFcmToken);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/addresses')
  .post(protect, addAddress);
router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/settings')
  .get(getSystemSettings)
  .put(protect, authorizeRoles('Super Admin', 'Manager'), updateSystemSettings);

export default router;
