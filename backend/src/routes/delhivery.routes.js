import express from 'express';
import { 
  createShipment, 
  trackShipment, 
  cancelShipment, 
  generateLabel,
  generateManifest,
  requestPickup
} from '../controllers/delhivery.controller.js';
import { delhiveryWebhookHandler } from '../webhooks/delhivery.webhook.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/create/:orderId', protect, authorizeRoles('Admin', 'Staff'), createShipment);
router.post('/cancel/:waybill', protect, authorizeRoles('Admin', 'Staff'), cancelShipment);
router.post('/pickup', protect, authorizeRoles('Admin', 'Staff'), requestPickup);
router.get('/label/:waybill', protect, authorizeRoles('Admin', 'Staff'), generateLabel);
router.get('/manifest/:waybill', protect, authorizeRoles('Admin', 'Staff'), generateManifest);

// Public / User routes
// We allow users to track if they have the waybill
router.get('/track/:waybill', protect, trackShipment);

// Webhook for Delhivery server-to-server updates
router.post('/webhook', delhiveryWebhookHandler);

export default router;
