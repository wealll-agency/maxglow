import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Combo from '../models/Combo.js';
import { invalidateUserCache } from '../middleware/auth.js';

// Helper to populate and calculate cart details
const populateCartItems = async (cartItems) => {
  if (!cartItems || cartItems.length === 0) return [];

  const productIds = [];
  const comboIds = [];
  cartItems.forEach(item => {
    const type = item.itemType || (item.combo ? 'Combo' : 'Product');
    const id = item.combo || item.product;
    if (id) {
      if (type === 'Combo') comboIds.push(id);
      else productIds.push(id);
    }
  });

  const [products, combos] = await Promise.all([
    productIds.length > 0 ? Product.find({ _id: { $in: productIds }, isActive: true }).select('name price stock images discount discountType slug category packSizes unit unitValue').lean() : [],
    comboIds.length > 0 ? Combo.find({ _id: { $in: comboIds }, isActive: true }).select('name price stock images discount discountType slug').lean() : []
  ]);

  const productMap = new Map(products.map(p => [p._id.toString(), p]));
  const comboMap = new Map(combos.map(c => [c._id.toString(), c]));

  const populatedCart = [];
  
  for (const item of cartItems) {
    const type = item.itemType || (item.combo ? 'Combo' : 'Product');
    const idStr = (item.combo || item.product) ? (item.combo || item.product).toString() : '';
    
    const itemData = type === 'Combo' ? comboMap.get(idStr) : productMap.get(idStr);
    
    // Only include active items with stock
    if (itemData && itemData.stock > 0) {
      const finalQuantity = Math.min(item.quantity, itemData.stock);
      const itemSize = item.selectedAttributes && item.selectedAttributes.size ? item.selectedAttributes.size : (item.size || 'Default');
      
      let basePrice = itemData.price;
      if (type === 'Product' && itemData.packSizes && itemData.packSizes.length > 0) {
        const pack = itemData.packSizes.find(p => `${p.weight} ${p.unit}` === itemSize);
        if (pack && pack.price) {
          basePrice = pack.price;
        }
      }

      let finalPrice = basePrice;
      if (itemData.discount > 0) {
        if (itemData.discountType === 'Percent') {
          finalPrice = basePrice - (basePrice * (itemData.discount / 100));
        } else {
          finalPrice = basePrice - itemData.discount;
        }
      }
      finalPrice = Math.max(0, Math.round(finalPrice));

      populatedCart.push({
        ...(type === 'Combo' ? { combo: idStr } : { product: idStr }),
        name: itemData.name,
        price: finalPrice,
        image: itemData.image || (itemData.images && itemData.images.length > 0 ? itemData.images[0] : '/placeholder.png'),
        quantity: finalQuantity,
        size: itemSize,
        maxStock: itemData.stock,
        itemType: type,
        _id: idStr
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
    const existingWishlistStrs = new Set((user.wishlist || []).filter(id => id).map(id => id.toString()));
    for (const pid of localWishlist || []) {
      if (!pid) continue;
      const pStr = typeof pid === 'object' ? pid._id : pid;
      if (pStr && mongoose.Types.ObjectId.isValid(pStr)) {
        existingWishlistStrs.add(pStr.toString());
      }
    }
    user.wishlist = Array.from(existingWishlistStrs);

    // 2. Merge Cart by Product ID/Combo ID + Size
    const cartMap = new Map();
    (user.cart || []).forEach(item => {
      const type = item.itemType || (item.combo ? 'Combo' : 'Product');
      const id = item.combo || item.product;
      if (id) {
        const size = item.selectedAttributes?.size || item.size || 'Default';
        const key = `${type}_${id.toString()}_${size}`;
        cartMap.set(key, item);
      }
    });
    
    for (const localItem of localCart || []) {
      if (!localItem) continue;
      const type = localItem.itemType || (localItem.combo ? 'Combo' : 'Product');
      const idSource = localItem.combo || localItem.product || localItem._id;
      const pidStr = idSource ? (typeof idSource === 'object' ? idSource._id : idSource) : null;
      if (!pidStr || !mongoose.Types.ObjectId.isValid(pidStr)) continue;

      const size = localItem.selectedAttributes?.size || localItem.size || 'Default';
      const key = `${type}_${pidStr.toString()}_${size}`;

      if (cartMap.has(key)) {
        const existingItem = cartMap.get(key);
        existingItem.quantity = Math.max(existingItem.quantity, localItem.quantity || 1);
      } else {
        cartMap.set(key, {
          ...(type === 'Combo' ? { combo: pidStr } : { product: pidStr }),
          itemType: type,
          quantity: localItem.quantity || 1,
          selectedAttributes: { size }
        });
      }
    }

    user.cart = Array.from(cartMap.values());
    await user.save({ session });
    await session.commitTransaction();
    invalidateUserCache(userId);

    // 3. Populate and recalculate final server-side data
    const populatedCart = await populateCartItems(user.cart);
    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).select('name price stock images discount discountType slug category').lean();

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
    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).select('name price stock images discount discountType slug category').lean();

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
  const { product, combo, itemType = 'Product', quantity, selectedAttributes, size } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const itemSize = selectedAttributes?.size || size || 'Default';
    const idSource = combo || product;
    const idStr = idSource ? idSource.toString() : '';

    const itemIndex = user.cart.findIndex(i => {
      const iType = i.itemType || (i.combo ? 'Combo' : 'Product');
      const iId = i.combo || i.product;
      return iType === itemType && iId && iId.toString() === idStr && (i.selectedAttributes?.size || i.size || 'Default') === itemSize;
    });

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity = quantity; // Update quantity directly
    } else {
      user.cart.push({ 
        ...(itemType === 'Combo' ? { combo: idStr } : { product: idStr }),
        itemType,
        quantity, 
        selectedAttributes: { size: itemSize } 
      });
    }
    await user.save();
    invalidateUserCache(req.user._id);
    
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
    const prodId = req.params.productId;
    const reqSize = req.query.size || req.body?.size;
    const reqType = req.query.itemType || req.body?.itemType || 'Product';

    user.cart = user.cart.filter(i => {
      const iType = i.itemType || (i.combo ? 'Combo' : 'Product');
      const iId = i.combo || i.product;
      if (!iId) return false;
      const isSameProd = iId.toString() === prodId && iType === reqType;
      if (!isSameProd) return true;
      if (reqSize) {
        const itemSize = i.selectedAttributes?.size || i.size || 'Default';
        return itemSize !== reqSize;
      }
      return false;
    });

    await user.save();
    invalidateUserCache(req.user._id);

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
    invalidateUserCache(req.user._id);

    const populatedWishlist = await Product.find({ _id: { $in: user.wishlist }, isActive: true }).select('name price stock images discount discountType slug category').lean();
    res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    next(error);
  }
};
