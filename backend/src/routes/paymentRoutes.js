import express from 'express';
import { getAllPayments, markPaymentAsPaid } from '../controllers/paymentController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('Admin', 'Super Admin'), getAllPayments);
router.put('/:id/mark-paid', protect, authorizeRoles('Admin', 'Super Admin'), markPaymentAsPaid);

export default router;
