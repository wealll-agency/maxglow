import express from 'express';
import { 
  getCategories, 
  createCategory, 
  addSubCategory,
  deleteCategory,
  deleteSubCategory
} from '../controllers/categoryController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route to get all categories for the shop page
router.get('/', getCategories);

// Apply auth middleware to all other routes
router.use(protect, authorizeRoles('Admin', 'Super Admin'));

router.post('/', createCategory);

router.route('/:id')
  .delete(deleteCategory);

router.route('/:id/subcategories')
  .post(addSubCategory);

router.route('/:id/subcategories/:subCategoryName')
  .delete(deleteSubCategory);

export default router;

