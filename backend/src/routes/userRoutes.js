import express from 'express';
import { 
  syncCartWishlist, 
  getUserData, 
  addToCart, 
  removeFromCart, 
  toggleWishlist 
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All user routes require authentication

router.post('/sync', syncCartWishlist);
router.get('/data', getUserData);

router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);

router.post('/wishlist', toggleWishlist);

export default router;
