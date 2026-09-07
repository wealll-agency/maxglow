import express from 'express';
import {
  getCustomSections,
  createCustomSection,
  updateCustomSectionProducts,
  deleteCustomSection
} from '../controllers/customSectionController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();
const admin = authorizeRoles('Admin', 'Super Admin');

router.route('/')
  .get(getCustomSections)
  .post(protect, admin, createCustomSection);

router.route('/:id')
  .put(protect, admin, updateCustomSectionProducts)
  .delete(protect, admin, deleteCustomSection);

export default router;
