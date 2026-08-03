import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

const getInitialCart = () => {
  return [];
};

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload, { getState, dispatch }) => {
    dispatch(addToCartLocal(payload));
    const token = getState().auth?.token || localStorage.getItem('maxglow_token');
    if (token) {
      try {
        await api.post('/user/cart', { 
          product: payload.product._id, 
          quantity: payload.quantity, 
          selectedAttributes: { size: payload.size } 
        });
      } catch (err) { console.error('Cart sync error:', err); }
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (payload, { getState, dispatch }) => {
    dispatch(removeFromCartLocal(payload));
    const token = getState().auth?.token || localStorage.getItem('maxglow_token');
    if (token) {
      try {
        await api.delete(`/user/cart/${payload.product}`);
      } catch (err) { console.error('Cart sync error:', err); }
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateCartQuantity',
  async (payload, { getState, dispatch }) => {
    dispatch(updateCartQuantityLocal(payload));
    const token = getState().auth?.token || localStorage.getItem('maxglow_token');
    if (token) {
      try {
        await api.post('/user/cart', { 
          product: payload.product, 
          quantity: payload.quantity, 
          selectedAttributes: { size: payload.size } 
        });
      } catch (err) { console.error('Cart sync error:', err); }
    }
  }
);

const calculateTotals = (items, discountPercentage = 0, applicableProducts = [], isCombo = false) => {
  let subtotal = 0;
  let discountableSubtotal = 0;

  const cartProductIds = items.map(item => item.product);
  const hasAllComboProducts = isCombo && applicableProducts.length > 0 
    ? applicableProducts.every(pid => cartProductIds.includes(pid))
    : false;

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    if (applicableProducts && applicableProducts.length > 0) {
      if (isCombo) {
        if (hasAllComboProducts && applicableProducts.includes(item.product)) {
          discountableSubtotal += itemTotal;
        }
      } else {
        if (applicableProducts.includes(item.product)) {
          discountableSubtotal += itemTotal;
        }
      }
    } else {
      discountableSubtotal += itemTotal;
    }
  });

  const discount = Math.round((discountableSubtotal * discountPercentage) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  // GST (5%) is Included in product MRP
  const tax = Math.round(discountedSubtotal - (discountedSubtotal / 1.05));
  const shippingFee = discountedSubtotal > 500 || items.length === 0 ? 0 : 40;
  const total = discountedSubtotal + shippingFee;

  return { subtotal, discount, tax, shippingFee, total, discountableSubtotal };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    couponCode: '',
    discountPercentage: 0,
    applicableProducts: [],
    isCombo: false,
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingFee: 0,
    total: 0,
    discountableSubtotal: 0
  },
  reducers: {
    addToCartLocal: (state, action) => {
      const { product, quantity, size } = action.payload;
      const activePrice = product.price;

      const existingIndex = state.items.findIndex(
        item => item.product === product._id && item.size === size
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          price: activePrice,
          image: product.image || (product.images && product.images[0]) || '',
          quantity,
          size,
          maxStock: product.stock
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    removeFromCartLocal: (state, action) => {
      const { product, size } = action.payload;
      state.items = state.items.filter(item => !(item.product === product && item.size === size));

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    updateCartQuantityLocal: (state, action) => {
      const { product, size, quantity } = action.payload;
      const item = state.items.find(item => item.product === product && item.size === size);
      if (item) {
        item.quantity = Math.max(1, Math.min(item.maxStock, quantity));
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    applyCouponCode: (state, action) => {
      const { code, discountPercentage, applicableProducts, isCombo } = action.payload;
      state.couponCode = code;
      state.discountPercentage = discountPercentage;
      state.applicableProducts = applicableProducts || [];
      state.isCombo = isCombo || false;

      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discountPercentage = 0;
      state.applicableProducts = [];
      state.isCombo = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('maxglow_cart');
      }
      const totals = calculateTotals([], 0, [], false);
      Object.assign(state, totals);
    },
    recalculateCart: (state) => {
      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    hydrateCart: (state, action) => {
      state.items = action.payload;
      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    }
  }
});

export const { addToCartLocal, removeFromCartLocal, updateCartQuantityLocal, applyCouponCode, clearCart, recalculateCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
