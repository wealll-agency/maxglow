import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';
import { hydrateCart, clearCart } from './cartSlice';
import { hydrateWishlist, clearWishlist } from './wishlistSlice';

const getInitialUser = () => {
  return null;
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, phone }, { rejectWithValue, dispatch }) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('maxglow_cart') || '[]');
      const localWishlist = JSON.parse(localStorage.getItem('maxglow_wishlist') || '[]');
      const response = await api.post(`/auth/register`, { name, email, password, phone, localCart, localWishlist });
      if (response.data.cart) dispatch(hydrateCart(response.data.cart));
      if (response.data.wishlist) dispatch(hydrateWishlist(response.data.wishlist));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password, rememberMe }, { rejectWithValue, dispatch }) => {
    try {
      const localCart = JSON.parse(localStorage.getItem('maxglow_cart') || '[]');
      const localWishlist = JSON.parse(localStorage.getItem('maxglow_wishlist') || '[]');
      const response = await api.post(`/auth/login`, { email, password, rememberMe, localCart, localWishlist });
      if (response.data.cart) dispatch(hydrateCart(response.data.cart));
      if (response.data.wishlist) dispatch(hydrateWishlist(response.data.wishlist));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/auth/logout`);
      dispatch(clearCart());
      dispatch(clearWishlist());
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/profile`, profileData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/auth/addresses`, addressData);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/auth/addresses/${addressId}`);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'auth/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/addresses/${addressId}`, addressData);
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    loading: true, // Start as true to prevent premature redirects during hydration
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.loading = false; // Hydration complete
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('maxglow_user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('maxglow_user');
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('maxglow_user', JSON.stringify(action.payload));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('maxglow_user', JSON.stringify(action.payload));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('maxglow_user');
          localStorage.removeItem('maxglow_token');
          localStorage.removeItem('admin_token');
        }
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('maxglow_user', JSON.stringify(action.payload));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Address
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Delete Address
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      })
      // Update Address
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
        }
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
