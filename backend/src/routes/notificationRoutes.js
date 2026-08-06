import express from 'express';
import { getNotifications, createStockNotification, getStockNotificationsAdmin, getBadgeCounts } from '../controllers/notificationController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getNotifications);
router.get('/badge-counts', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getBadgeCounts);

// Stock notification routes
router.post('/stock', protect, createStockNotification);
router.get('/admin/stock', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getStockNotificationsAdmin);

export default router;
