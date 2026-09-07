import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params: filterParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data.reviews;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load reviews');
    }
  }
);

export const submitProductReview = createAsyncThunk(
  'products/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data.review;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const deleteProductReview = createAsyncThunk(
  'products/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    total: 0,
    pages: 1,
    currentPage: 1,
    selectedProduct: null,
    reviews: [],
    loading: true,
    isFetched: false,
    detailsLoading: false,
    reviewsLoading: false,
    error: null
  },
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.reviews = [];
    },
    hydrateProducts: (state, action) => {
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        state.items = action.payload;
        state.loading = false;
        state.isFetched = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.isFetched = true;
        const productsList = action.payload?.products || [];
        state.items = productsList;
        state.total = action.payload?.total || 0;
        state.pages = action.payload?.pages || 1;
        state.currentPage = action.payload?.currentPage || 1;
        if (typeof window !== 'undefined' && productsList.length > 0) {
          try {
            localStorage.setItem('maxglow_cached_products', JSON.stringify(productsList));
          } catch (e) {
            console.error('Failed to cache products', e);
          }
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.isFetched = true;
        state.error = action.payload;
      })
      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })
      // Fetch Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsLoading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload;
      })
      // Submit Review
      .addCase(submitProductReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
      })
      // Delete Review
      .addCase(deleteProductReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload.reviewId);
      });
  }
});

export const { clearSelectedProduct, hydrateProducts } = productsSlice.actions;
export default productsSlice.reducer;
