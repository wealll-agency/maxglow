import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  return [];
};

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
    
    if (isCombo) {
      if (hasAllComboProducts && applicableProducts.includes(item.product)) {
        discountableSubtotal += itemTotal;
      }
    } else {
      if (!applicableProducts || applicableProducts.length === 0 || applicableProducts.includes(item.product)) {
        discountableSubtotal += itemTotal;
      }
    }
  });

  const discount = Math.round((discountableSubtotal * discountPercentage) / 100);
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.05); // 5% GST
  const shippingFee = taxableAmount > 500 || items.length === 0 ? 0 : 40;
  const total = taxableAmount + tax + shippingFee;

  return { subtotal, discount, tax, shippingFee, total };
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
    total: 0
  },
  reducers: {
    addToCart: (state, action) => {
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
    removeFromCart: (state, action) => {
      const { product, size } = action.payload;
      state.items = state.items.filter(item => !(item.product === product && item.size === size));

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_cart', JSON.stringify(state.items));
      }

      const totals = calculateTotals(state.items, state.discountPercentage, state.applicableProducts, state.isCombo);
      Object.assign(state, totals);
    },
    updateCartQuantity: (state, action) => {
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

export const { addToCart, removeFromCart, updateCartQuantity, applyCouponCode, clearCart, recalculateCart, hydrateCart } = cartSlice.actions;
export default cartSlice.reducer;
