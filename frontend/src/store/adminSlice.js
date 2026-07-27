import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axiosConfig';

const PRODUCTS_URL = '/products';
const ORDERS_URL = '/orders';
const REPORTS_URL = '/reports';
const REFUNDS_URL = '/refunds';
const DELHIVERY_URL = '/delhivery';
const WAREHOUSES_URL = '/warehouses';

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${REPORTS_URL}/dashboard`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.subCategory) queryParams.append('subCategory', filters.subCategory);
      if (filters.subSubCategory) queryParams.append('subSubCategory', filters.subSubCategory);
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`${PRODUCTS_URL}${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const toggleProductState = createAsyncThunk(
  'admin/toggleProductState',
  async ({ id, field, value }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${PRODUCTS_URL}/${id}/toggle`, { field, value });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle product status');
    }
  }
);

export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(PRODUCTS_URL, productData);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

export const editProduct = createAsyncThunk(
  'admin/editProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${PRODUCTS_URL}/${id}`, data);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'admin/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/reviews/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const fetchWarehouses = createAsyncThunk(
  'admin/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(WAREHOUSES_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'admin/createWarehouse',
  async (warehouseData, { rejectWithValue }) => {
    try {
      const response = await axios.post(WAREHOUSES_URL, warehouseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'admin/updateWarehouse',
  async ({ id, warehouseData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${WAREHOUSES_URL}/${id}`, warehouseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'admin/deleteWarehouse',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${WAREHOUSES_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouse');
    }
  }
);

export const removeProduct = createAsyncThunk(
  'admin/removeProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${PRODUCTS_URL}/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const fetchAdminShipments = createAsyncThunk(
  'admin/fetchAdminShipments',
  async ({ pageNumber = 1, keyword = '', status = '' } = {}, { rejectWithValue }) => {
    try {
      let url = `${ORDERS_URL}/shipments?pageNumber=${pageNumber}&keyword=${keyword}`;
      if (status) {
        url += `&status=${status}`;
      }
      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shipments');
    }
  }
);

export const fetchShipmentByWaybill = createAsyncThunk(
  'admin/fetchShipmentByWaybill',
  async (waybill, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${ORDERS_URL}/shipments/${waybill}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shipment details');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`${ORDERS_URL}${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${ORDERS_URL}/${id}/status`, { status, trackingNumber });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const refundOrder = createAsyncThunk(
  'admin/refundOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${ORDERS_URL}/${orderId}/refund`, {});
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
    }
  }
);

export const fetchRefundRequests = createAsyncThunk(
  'admin/fetchRefundRequests',
  async (status, { rejectWithValue }) => {
    try {
      const url = status ? `${REFUNDS_URL}?status=${status}` : REFUNDS_URL;
      const response = await axios.get(url);
      return response.data.refunds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch refund requests');
    }
  }
);

export const updateRefundRequestStatus = createAsyncThunk(
  'admin/updateRefundRequestStatus',
  async ({ id, status, adminComment }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${REFUNDS_URL}/${id}/status`, { status, adminComment });
      return response.data.refund;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update refund status');
    }
  }
);

// Delhivery Integrations
export const createDelhiveryShipment = createAsyncThunk(
  'admin/createDelhiveryShipment',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${DELHIVERY_URL}/create/${orderId}`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create Delhivery shipment');
    }
  }
);

export const cancelDelhiveryShipment = createAsyncThunk(
  'admin/cancelDelhiveryShipment',
  async (waybill, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${DELHIVERY_URL}/cancel/${waybill}`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel Delhivery shipment');
    }
  }
);

export const getDelhiveryLabel = createAsyncThunk(
  'admin/getDelhiveryLabel',
  async (waybill, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${DELHIVERY_URL}/label/${waybill}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate shipping label');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    salesOverview: [],
    topProducts: [],
    lowStockDetails: [],
    products: [],
    productsTotalPages: 1,
    productsCurrentPage: 1,
    orders: [],
    ordersTotalPages: 1,
    ordersCurrentPage: 1,
    refunds: [],
    shipments: [],
    shipmentsTotalPages: 1,
    shipmentsCurrentPage: 1,
    selectedShipment: null,
    warehouses: [],
    loading: false,
    ordersLoading: false,
    productsLoading: false,
    refundsLoading: false,
    error: null
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.salesOverview = action.payload.salesOverview;
        state.topProducts = action.payload.topProducts;
        state.lowStockDetails = action.payload.lowStockDetails;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Admin products list
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products || action.payload;
        state.productsTotalPages = action.payload.pages || 1;
        state.productsCurrentPage = action.payload.currentPage || 1;
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Edit product
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index > -1) {
          state.products[index] = action.payload;
        }
      })
      // Toggle product state
      .addCase(toggleProductState.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index > -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete product
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      // Admin orders list
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders || action.payload;
        state.ordersTotalPages = action.payload.pages || 1;
        state.ordersCurrentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAdminShipments.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchAdminShipments.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.shipments = action.payload.shipments;
        state.shipmentsTotalPages = action.payload.pages;
        state.shipmentsCurrentPage = action.payload.page;
      })
      .addCase(fetchAdminShipments.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchShipmentByWaybill.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchShipmentByWaybill.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.selectedShipment = action.payload;
      })
      .addCase(fetchShipmentByWaybill.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      // Refund order
      .addCase(refundOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      // Fetch refund requests
      .addCase(fetchRefundRequests.pending, (state) => {
        state.refundsLoading = true;
      })
      .addCase(fetchRefundRequests.fulfilled, (state, action) => {
        state.refundsLoading = false;
        state.refunds = action.payload;
      })
      // Update refund request status
      .addCase(updateRefundRequestStatus.fulfilled, (state, action) => {
        const index = state.refunds.findIndex(r => r._id === action.payload._id);
        if (index > -1) {
          state.refunds[index] = action.payload;
        }
      })
      
      // Warehouse Reducers
      .addCase(fetchWarehouses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.unshift(action.payload);
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter(w => w._id !== action.payload);
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
