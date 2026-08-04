import express from 'express';
import {
  createProductReview,
  getProductReviews,
  getFeaturedReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createProductReview);
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', getProductReviews);

export default router;
