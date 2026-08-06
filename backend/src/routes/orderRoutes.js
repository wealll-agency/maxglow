import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  processRefund,
  getAdminShipments,
  getShipmentByWaybill
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 order requests per window
  message: 'Too many order requests from this IP, please try again after 15 minutes'
});

router.route('/')
  .post(protect, orderLimiter, createOrder)
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getAllOrders);

router.route('/shipments')
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getAdminShipments);

router.route('/shipments/:waybill')
  .get(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getShipmentByWaybill);

router.post('/verify-payment', verifyPayment);
router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.put('/:id/status', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), auditRoute('UPDATE_ORDER_STATUS'), updateOrderStatus);
router.post('/:id/refund', protect, authorizeRoles('Super Admin'), auditRoute('PROCESS_REFUND'), processRefund);

export default router;
