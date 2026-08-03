import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';

// Helper to populate and calculate cart details
const populateCartItems = async (cartItems) => {
  const productIds = cartItems.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
  const productMap = new Map(products.map(p => [p._id.toString(), p]));

  const populatedCart = [];
  
  for (const item of cartItems) {
    const product = productMap.get(item.product.toString());
    
    // Only include active products with stock
    if (product && product.stock > 0) {
      // Adjust quantity if it exceeds available stock
      const finalQuantity = Math.min(item.quantity, product.stock);
      
      let finalPrice = product.price;
      if (product.discount > 0) {
        if (product.discountType === 'Percent') {
          finalPrice = product.price - (product.price * (product.discount / 100));
        } else {
          finalPrice = product.price - product.discount;
        }
      }
      finalPrice = Math.max(0, finalPrice);

      populatedCart.push({
        _id: item.product, // Expose product id as _id to match guest cart logic
        product: product, // Full product object
        quantity: finalQuantity,
        price: finalPrice, // Server recalculated price
        selectedAttributes: item.selectedAttributes
      });
    }
  }
  return populatedCart;
};

export const performSync = async (userId, localCart, localWishlist) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // 1. Merge Wishlist (Idempotent)
    const existingWishlistStrs = new Set(user.wishlist.map(id => id.toString()));
    for (const pid of localWishlist || []) {
      if (mongoose.Types.ObjectId.isValid(pid)) {
        existingWishlistStrs.add(pid);
      }
    }
    user.wishlist = Array.from(existingWishlistStrs);

    // 2. Merge Cart (Idempotent)
    const cartMap = new Map(user.cart.map(item => [item.product.toString(), item]));
    
    for (const localItem of localCart || []) {
      const pidStr = localItem._id || localItem.product;
      if (!mongoose.Types.ObjectId.isValid(pidStr)) continue;

      if (cartMap.has(pidStr)) {
        const existingItem = cartMap.get(pidStr);
        existingItem.quantity = Math.max(existingItem.quantity, localItem.quantity);
      } else {
        cartMap.set(pidStr, {
          product: pidStr,
          quantity: localItem.quantity,
          selectedAttributes: localItem.selectedAttributes || {}
        });
      }
    }

    user.cart = Array.from(cartMap.values());
    await user.save({ session });
    await session.commitTransaction();

    // 3. Populate and recalculate final server-side data
    const populatedCart = await populateCartItems(user.cart);
    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).lean();

    return {
      cart: populatedCart,
      wishlist: populatedWishlist
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// @desc    Sync local cart and wishlist with database
// @route   POST /api/user/sync
// @access  Private
export const syncCartWishlist = async (req, res, next) => {
  const { cart: localCart = [], wishlist: localWishlist = [] } = req.body;
  try {
    const result = await performSync(req.user._id, localCart, localWishlist);
    res.json({
      success: true,
      cart: result.cart,
      wishlist: result.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart and wishlist
// @route   GET /api/user/data
// @access  Private
export const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const populatedCart = await populateCartItems(user.cart);
    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).lean();

    res.json({
      success: true,
      cart: populatedCart,
      wishlist: populatedWishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update item in cart
// @route   POST /api/user/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  const { product, quantity, selectedAttributes } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const itemIndex = user.cart.findIndex(i => i.product.toString() === product);

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity; // Update quantity directly
    } else {
      user.cart.push({ product, quantity, selectedAttributes });
    }
    await user.save();
    
    const populatedCart = await populateCartItems(user.cart);
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/user/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
    await user.save();

    const populatedCart = await populateCartItems(user.cart);
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/user/wishlist
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const index = user.wishlist.indexOf(productId);
    
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).lean();
    res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    next(error);
  }
};
