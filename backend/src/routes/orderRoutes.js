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

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
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
