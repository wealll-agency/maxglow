import express from 'express';
import {
  createProductReview,
  getProductReviews,
  getFeaturedReviews,
  deleteProductReview
} from '../controllers/reviewController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createProductReview);
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', getProductReviews);
router.delete('/:id', protect, authorizeRoles('Super Admin', 'Admin', 'Manager', 'Staff'), deleteProductReview);

export default router;
