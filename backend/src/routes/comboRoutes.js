import express from 'express';
import {
  getCombos,
  getComboById,
  getAdminCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  duplicateCombo
} from '../controllers/comboController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/admin/all', protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), getAdminCombos);
router.post('/admin', protect, authorizeRoles('Super Admin', 'Manager'), createCombo);
router.put('/admin/:id', protect, authorizeRoles('Super Admin', 'Manager'), updateCombo);
router.delete('/admin/:id', protect, authorizeRoles('Super Admin', 'Manager'), deleteCombo);
router.post('/admin/:id/duplicate', protect, authorizeRoles('Super Admin', 'Manager'), duplicateCombo);

// Public routes
router.get('/', getCombos);
router.get('/:id', getComboById);

export default router;
