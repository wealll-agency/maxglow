import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

const getInitialCart = () => {
  return [];
};

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload, { getState, dispatch }) => {
    dispatch(addToCartLocal(payload));
    
    const state = getState();
    const isComboItem = payload.itemType === 'Combo' || !!payload.combo;
    const prodId = isComboItem 
      ? (payload.combo?._id || payload.combo) 
      : (payload.product?._id || payload.product);
    const itemSize = payload.size || 'Default';

    // Get the newly calculated absolute quantity from Redux state
    const item = state.cart.items.find(i => {
      const iId = String(i.product?._id || i.product || i.combo?._id || i.combo || '');
      return iId === String(prodId) && (i.size || 'Default') === itemSize;
    });
    const finalQuantity = item ? item.quantity : (payload.quantity || 1);

    const isAuth = !!state.auth?.user;
    if (isAuth) {
      try {
        await api.post('/user/cart', { 
          product: isComboItem ? undefined : String(prodId), 
          combo: isComboItem ? String(prodId) : undefined,
          itemType: isComboItem ? 'Combo' : 'Product',
          quantity: finalQuantity, 
          size: itemSize,
          selectedAttributes: { size: itemSize } 
        });
      } catch (err) { 
        console.error('Cart sync error:', err); 
      }
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (payload, { getState, dispatch }) => {
    dispatch(removeFromCartLocal(payload));
    
    const state = getState();
    const isAuth = !!state.auth?.user;
    const isComboItem = payload.itemType === 'Combo' || !!payload.combo;
    const prodId = isComboItem 
      ? (payload.combo?._id || payload.combo) 
      : (payload.product?._id || payload.product);
    const itemSize = payload.size || 'Default';

    if (isAuth && prodId) {
      try {
        await api.delete(`/user/cart/${prodId}?size=${encodeURIComponent(itemSize)}&itemType=${isComboItem ? 'Combo' : 'Product'}`);
      } catch (err) { 
        console.error('Cart sync error:', err); 
      }
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async (payload, { getState, dispatch }) => {
    dispatch(updateCartQuantityLocal(payload));
    
    const state = getState();
    const isAuth = !!state.auth?.user;
    const isComboItem = payload.itemType === 'Combo' || !!payload.combo;
    const prodId = isComboItem 
      ? (payload.combo?._id || payload.combo) 
      : (payload.product?._id || payload.product);
    const itemSize = payload.size || 'Default';

    if (isAuth && prodId) {
      try {
        await api.post('/user/cart', { 
          product: isComboItem ? undefined : String(prodId), 
          combo: isComboItem ? String(prodId) : undefined,
          itemType: isComboItem ? 'Combo' : 'Product',
          quantity: payload.quantity, 
          size: itemSize,
          selectedAttributes: { size: itemSize } 
        });
      } catch (err) { 
        console.error('Cart sync error:', err); 
      }
    }
  }
);

const calculateTotals = (items, couponParams = {}) => {
  const {
    couponCode = '',
    discountType = 'percentage',
    discountPercentage = 0,
    flatDiscountAmount = 0,
    applicableProducts = [],
    isCombo = false,
    minOrderValue = 0
  } = couponParams;

  let subtotal = 0;
  let discountableSubtotal = 0;

  const cartProductIds = items.filter(i => i.itemType !== 'Combo').map(item => String(typeof item.product === 'object' ? item.product._id : item.product));
  const cartComboIds = items.filter(i => i.itemType === 'Combo').map(item => String(typeof item.combo === 'object' ? item.combo._id : item.combo));
  const appProdIds = (applicableProducts || []).map(p => String(typeof p === 'object' ? (p._id || p) : p));

  const hasAllComboProducts = isCombo && appProdIds.length > 0 
    ? appProdIds.every(pid => cartProductIds.includes(pid) || cartComboIds.includes(pid))
    : false;

  items.forEach(item => {
    const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    subtotal += itemTotal;
    
    const itemIdStr = String(item.product?._id || item.product || item.combo?._id || item.combo || '');
    if (appProdIds.length > 0) {
      if (isCombo) {
        if (hasAllComboProducts && appProdIds.includes(itemIdStr)) {
          discountableSubtotal += itemTotal;
        }
      } else {
        if (appProdIds.includes(itemIdStr)) {
          discountableSubtotal += itemTotal;
        }
      }
    } else {
      discountableSubtotal += itemTotal;
    }
  });

  let isCouponValid = true;
  let invalidReason = '';

  if (couponCode) {
    if (items.length === 0) {
      isCouponValid = false;
      invalidReason = 'Cart is empty.';
    } else if (minOrderValue > 0 && subtotal < minOrderValue) {
      isCouponValid = false;
      invalidReason = `Coupon '${couponCode}' was removed because the minimum order amount of ₹${minOrderValue} is no longer met.`;
    } else if (appProdIds.length > 0) {
      if (isCombo && !hasAllComboProducts) {
        isCouponValid = false;
        invalidReason = `Coupon '${couponCode}' was removed because your cart no longer contains all required combo items.`;
      } else if (!isCombo && !items.some(item => {
        const iId = String(item.product?._id || item.product || item.combo?._id || item.combo || '');
        return appProdIds.includes(iId);
      })) {
        isCouponValid = false;
        invalidReason = `Coupon '${couponCode}' was removed because your cart no longer contains any eligible items.`;
      }
    }
  } else {
    isCouponValid = false;
  }

  let discount = 0;
  if (couponCode && isCouponValid) {
    if (discountType === 'flat') {
      discount = Math.min(flatDiscountAmount, discountableSubtotal);
    } else {
      discount = Math.round((discountableSubtotal * discountPercentage) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal - (discountedSubtotal / 1.05));
  
  let shippingFee = 0;
  if (items.length > 0) {
    if (couponParams.shippingTiers && couponParams.shippingTiers.length > 0) {
      const matchingTier = couponParams.shippingTiers.find(tier => {
        const min = parseFloat(tier.min) || 0;
        const max = parseFloat(tier.max) || Infinity;
        return subtotal >= min && subtotal <= max;
      });
      shippingFee = matchingTier ? (parseFloat(matchingTier.fee) || 0) : 0;
    }
  }

  const total = discountedSubtotal + shippingFee;

  return { subtotal, discount, tax, shippingFee, total, discountableSubtotal, isCouponValid, invalidReason };
};

const updateTotalsAndCheckCoupon = (state) => {
  const totals = calculateTotals(state.items, {
    couponCode: state.couponCode,
    discountType: state.discountType,
    discountPercentage: state.discountPercentage,
    flatDiscountAmount: state.flatDiscountAmount,
    applicableProducts: state.applicableProducts,
    isCombo: state.isCombo,
    minOrderValue: state.minOrderValue,
    shippingTiers: state.shippingTiers
  });

  if (state.couponCode && !totals.isCouponValid) {
    state.removedCouponNotice = totals.invalidReason;
    state.couponCode = '';
    state.discountType = 'percentage';
    state.discountPercentage = 0;
    state.flatDiscountAmount = 0;
    state.applicableProducts = [];
    state.isCombo = false;
    state.minOrderValue = 0;
    state.discount = 0;
  } else {
    state.discount = totals.discount;
  }

  state.subtotal = totals.subtotal;
  state.tax = totals.tax;
  state.shippingFee = totals.shippingFee;
  state.total = totals.total;
  state.discountableSubtotal = totals.discountableSubtotal;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    isHydrated: false,
    isCartSyncing: true, // Initially true until ReduxProvider finishes fetching from server
    couponCode: '',
    discountType: 'percentage',
    discountPercentage: 0,
    flatDiscountAmount: 0,
    applicableProducts: [],
    isCombo: false,
    minOrderValue: 0,
    removedCouponNotice: null,
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingFee: 0,
    total: 0,
    discountableSubtotal: 0,
    shippingTiers: []
  },
  reducers: {
    setShippingTiers: (state, action) => {
      state.shippingTiers = action.payload || [];
      updateTotalsAndCheckCoupon(state);
    },
    setCartSyncing: (state, action) => {
      state.isCartSyncing = action.payload;
    },
    addToCartLocal: (state, action) => {
      state.isHydrated = true;
      const { product, combo, itemType = 'Product', quantity = 1, size = 'Default' } = action.payload || {};
      
      const isComboItem = itemType === 'Combo' || !!combo;
      const activePrice = isComboItem ? (combo.comboPrice || 0) : (product.price || 0);
      const itemId = isComboItem 
        ? String(combo._id || combo) 
        : String(product._id || product);
      const itemSize = size || 'Default';

      const existingIndex = state.items.findIndex(item => {
        const itemProdId = String(item.product?._id || item.product || item.combo?._id || item.combo || '');
        const itemTypeStr = item.itemType || (item.combo ? 'Combo' : 'Product');
        const itemSizeStr = item.size || 'Default';
        return itemProdId === itemId && itemTypeStr === (isComboItem ? 'Combo' : 'Product') && itemSizeStr === itemSize;
      });

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        const newItem = {
          itemType: isComboItem ? 'Combo' : 'Product',
          name: isComboItem ? combo.name : product.name,
          price: activePrice,
          image: isComboItem ? (combo.image || (combo.images && combo.images[0]) || '') : (product.image || (product.images && product.images[0]) || ''),
          quantity,
          size: itemSize,
          maxStock: isComboItem ? 100 : (product.stock || 100)
        };
        
        if (isComboItem) {
          newItem.combo = itemId;
        } else {
          newItem.product = itemId;
        }
        
        state.items.push(newItem);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      updateTotalsAndCheckCoupon(state);
    },
    removeFromCartLocal: (state, action) => {
      const { product, combo, itemType, size, _id } = action.payload || {};
      const targetId = String(product?._id || product || combo?._id || combo || _id || '');
      const targetSize = size || '';

      state.items = state.items.filter(item => {
        const itemProdId = String(item.product?._id || item.product || item.combo?._id || item.combo || item._id || '');
        const itemSize = item.size || '';

        const isSameId = itemProdId === targetId;
        const isSameSize = !targetSize || itemSize === targetSize || targetSize === 'Default' && (!itemSize || itemSize === 'Default');

        // If ID matches and size matches (or size wasn't specified), remove it
        if (isSameId && isSameSize) {
          return false;
        }
        return true;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      updateTotalsAndCheckCoupon(state);
    },
    updateCartQuantityLocal: (state, action) => {
      const { product, combo, size, quantity } = action.payload || {};
      const targetId = String(product?._id || product || combo?._id || combo || '');
      const targetSize = size || '';

      const item = state.items.find(i => {
        const itemProdId = String(i.product?._id || i.product || i.combo?._id || i.combo || '');
        const itemSize = i.size || '';
        return itemProdId === targetId && (!targetSize || itemSize === targetSize);
      });

      if (item) {
        const maxStock = item.maxStock || 100;
        item.quantity = Math.max(1, Math.min(maxStock, quantity));
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      updateTotalsAndCheckCoupon(state);
    },
    applyCouponCode: (state, action) => {
      const { code, discountType, discountPercentage, flatDiscountAmount, applicableProducts, isCombo, minOrderValue } = action.payload;
      state.couponCode = code;
      state.discountType = discountType || 'percentage';
      state.discountPercentage = discountPercentage || 0;
      state.flatDiscountAmount = flatDiscountAmount || 0;
      state.applicableProducts = applicableProducts || [];
      state.isCombo = isCombo || false;
      state.minOrderValue = minOrderValue || 0;

      updateTotalsAndCheckCoupon(state);
    },
    clearCart: (state) => {
      state.isHydrated = true;
      state.items = [];
      state.couponCode = '';
      state.discountType = 'percentage';
      state.discountPercentage = 0;
      state.flatDiscountAmount = 0;
      state.applicableProducts = [];
      state.isCombo = false;
      state.minOrderValue = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('maxglow_cart');
      }
      updateTotalsAndCheckCoupon(state);
    },
    recalculateCart: (state) => {
      updateTotalsAndCheckCoupon(state);
    },
    hydrateCart: (state, action) => {
      state.isHydrated = true;
      const rawList = Array.isArray(action.payload) ? action.payload : [];
      
      // Preserve existing Combo items since they are local-only and not synced to the backend
      const existingCombos = state.items.filter(i => i.itemType === 'Combo' || !!i.combo);
      
      const serverItems = rawList.map(item => ({
        ...item,
        itemType: item.itemType || (item.combo ? 'Combo' : 'Product'),
        product: String(item.product?._id || item.product || ''),
        combo: item.combo ? String(item.combo?._id || item.combo) : undefined,
        size: item.size || 'Default',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        maxStock: Number(item.maxStock) || 100
      }));
      
      // Merge server items with local combos
      state.items = [...serverItems, ...existingCombos];
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }
      updateTotalsAndCheckCoupon(state);
    },
    clearRemovedCouponNotice: (state) => {
      state.removedCouponNotice = null;
    }
  }
});

export const { setShippingTiers, setCartSyncing, addToCartLocal, removeFromCartLocal, updateCartQuantityLocal, applyCouponCode, clearCart, recalculateCart, hydrateCart, clearRemovedCouponNotice } = cartSlice.actions;
export default cartSlice.reducer;
