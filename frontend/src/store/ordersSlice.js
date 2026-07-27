import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/axiosConfig';

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders`, orderData);
      return response.data; // contains local order and razorpayOrder
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Order creation failed');
    }
  }
);



export const fetchMyOrders = createAsyncThunk(
  'orders/fetchAllMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/my-orders`);
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load order history');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const trackDelhiveryShipment = createAsyncThunk(
  'orders/trackDelhiveryShipment',
  async (waybill, { rejectWithValue }) => {
    try {
      const response = await api.get(`/delhivery/track/${waybill}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track shipment');
    }
  }
);

export const createRefundRequest = createAsyncThunk(
  'orders/createRefundRequest',
  async ({ orderId, reason, customerComment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/refunds/request/${orderId}`, { reason, customerComment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit refund request');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    activeOrder: null,
    ccavenuePayload: null,
    loading: false,
    orderLoading: false,
    error: null
  },
  reducers: {
    clearActiveOrder: (state) => {
      state.activeOrder = null;
      state.ccavenuePayload = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload.order;
        state.ccavenuePayload = {
          encRequest: action.payload.encRequest,
          accessCode: action.payload.accessCode
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.orderLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.orderLoading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.activeOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearActiveOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
