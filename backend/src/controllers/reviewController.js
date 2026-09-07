import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Add review for a product
// @route   POST /api/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  const { productId, rating, comment, images } = req.body;

  try {
    if (!rating || !comment || !productId) {
      return res.status(400).json({ success: false, message: 'Please provide product ID, rating and comment' });
    }

    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Check if user has bought this product to set verified purchase flag
    const orders = await Order.find({
      user: req.user._id,
      paymentStatus: 'Paid',
      'items.product': productId
    });
    const isVerifiedPurchase = orders.length > 0;

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
      images: images || [],
      isVerifiedPurchase
    });

    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    const mongoose = (await import('mongoose')).default;
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews: numReviews
    });

    await logActivity(req.user._id, 'ADD_REVIEW', `Submitted product review for product ID: ${productId}`, req);

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res, next) => {
  try {
    let productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const product = await Product.findOne({ slug: productId });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      productId = product._id;
    }

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 4 random 5-star reviews for the homepage
// @route   GET /api/reviews/featured
// @access  Public
export const getFeaturedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      { $match: { rating: 5, isVerifiedPurchase: true } },
      { $sample: { size: 4 } }
    ]);
    
    await Review.populate(reviews, [
      { path: 'user', select: 'name' },
      { path: 'product', select: 'name' }
    ]);

    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteProductReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating and numReviews
    const mongoose = (await import('mongoose')).default;
    const Product = mongoose.model('Product');
    const remainingReviews = await Review.find({ product: productId });
    const numReviews = remainingReviews.length;
    const avgRating = numReviews > 0 
      ? (remainingReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews) 
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: numReviews
    });

    await logActivity(req.user._id, 'DELETE_REVIEW', `Deleted review (${req.params.id}) for product ID: ${productId}`, req);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

