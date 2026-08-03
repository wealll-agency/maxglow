import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

const getInitialWishlist = () => {
  return [];
};

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (payload, { getState, dispatch }) => {
    dispatch(toggleWishlistLocal(payload));
    const token = getState().auth?.token || localStorage.getItem('maxglow_token');
    if (token) {
      try {
        await api.post('/user/wishlist', { productId: payload._id });
      } catch (err) { console.error('Wishlist sync error:', err); }
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getInitialWishlist()
  },
  reducers: {
    toggleWishlistLocal: (state, action) => {
      const product = action.payload; // Contains product object {_id, name, price, images, discount, category}
      const existingIndex = state.items.findIndex(item => item._id === product._id);

      if (existingIndex > -1) {
        state.items = state.items.filter(item => item._id !== product._id);
      } else {
        state.items.push(product);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('maxglow_wishlist', JSON.stringify(state.items));
      }
    },
    clearWishlist: (state) => {
      state.items = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('maxglow_wishlist');
      }
    },
    hydrateWishlist: (state, action) => {
      state.items = action.payload;
    }
  }
});

export const { toggleWishlistLocal, clearWishlist, hydrateWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
