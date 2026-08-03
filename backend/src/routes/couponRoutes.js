import express from 'express';
import {
  createCoupon,
  applyCoupon,
  getCoupons,
  deleteCoupon,
  getCouponAnalytics
} from '../controllers/couponController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('CREATE_COUPON'), createCoupon)
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getCoupons);

router.post('/apply', protect, applyCoupon);

router.get('/:id/analytics', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getCouponAnalytics);

router.route('/:id')
  .delete(protect, authorizeRoles('Super Admin'), auditRoute('DELETE_COUPON'), deleteCoupon);

export default router;
