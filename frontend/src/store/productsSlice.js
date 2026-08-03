import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/products` : 'https://maxglow.in/api/products';
const REVIEWS_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/reviews` : 'https://maxglow.in/api/reviews';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, { params: filterParams });
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
      const response = await axios.get(`${API_URL}/${productId}`);
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
      const response = await axios.get(`${REVIEWS_URL}/product/${productId}`);
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
      const response = await axios.post(REVIEWS_URL, reviewData, { withCredentials: true });
      return response.data.review;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
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
    loading: false,
    detailsLoading: false,
    reviewsLoading: false,
    error: null
  },
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.reviews = [];
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
        state.items = action.payload?.products || [];
        state.total = action.payload?.total || 0;
        state.pages = action.payload?.pages || 1;
        state.currentPage = action.payload?.currentPage || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
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
      });
  }
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
