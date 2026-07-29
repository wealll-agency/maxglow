import express from 'express';
import { 
  getCategories, 
  createCategory, 
  addSubCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect, authorizeRoles('Admin', 'Super Admin'));

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .delete(deleteCategory);

router.route('/:id/subcategories')
  .post(addSubCategory);

export default router;
