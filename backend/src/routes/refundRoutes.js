import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { 
  getRefundRequests, 
  updateRefundStatus, 
  createCustomerRefundRequest
} from '../controllers/refundController.js';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getRefundRequests);

router.route('/:id/status')
  .put(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), updateRefundStatus);

// Mock route for testing has been removed for production safety

// Customer route for creating a refund/cancel request
router.route('/request/:orderId')
  .post(protect, createCustomerRefundRequest);

export default router;
