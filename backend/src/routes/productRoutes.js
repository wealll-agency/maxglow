import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  bulkUpdateHomepageFlags
} from '../controllers/productController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { auditRoute } from '../middleware/logger.js';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

import Product from '../models/Product.js';

router.get('/migrate-selling-price', async (req, res) => {
  try {
    const products = await Product.find({});
    let updated = 0;
    for (let p of products) {
      if(p.discount > 0) {
        p.sellingPrice = p.discountType === 'Percent' ? Math.round(p.price * (1 - p.discount/100)) : Math.max(0, p.price - p.discount);
      } else {
        p.sellingPrice = p.price;
      }
      await p.save();
      updated++;
    }
    res.json({ success: true, updated });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('Super Admin', 'Manager', 'Staff'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'subImages', maxCount: 3 }, { name: 'video', maxCount: 1 }, { name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 10 }]), auditRoute('CREATE_PRODUCT'), createProduct);

router.route('/homepage/bulk-flags')
  .put(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('UPDATE_PRODUCT'), bulkUpdateHomepageFlags);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('Super Admin', 'Manager'), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'subImages', maxCount: 3 }, { name: 'video', maxCount: 1 }, { name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 10 }]), auditRoute('UPDATE_PRODUCT'), updateProduct)
  .delete(protect, authorizeRoles('Super Admin'), auditRoute('DELETE_PRODUCT'), deleteProduct);

router.route('/:id/toggle')
  .patch(protect, authorizeRoles('Super Admin', 'Manager'), auditRoute('UPDATE_PRODUCT'), toggleProductStatus);

export default router;
