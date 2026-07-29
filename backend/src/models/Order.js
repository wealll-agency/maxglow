import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 } // Price at the time of purchase
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String },
  addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  deliveryAddress: { type: shippingAddressSchema, required: true },
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, default: 0 },
  tax: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
    index: true
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Placed',
    index: true
  },
  trackingNumber: { type: String },
  confirmedAt: { type: Date },
  packedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paymentMode: { type: String },
  
  // Shipping Integration Fields (Multiple shipments support)
  shipments: [{
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    waybill: { type: String, index: true },
    trackingId: { type: String },
    status: { type: String, default: 'Manifested' },
    courierName: { type: String, default: 'Delhivery' },
    shippedAt: { type: Date },
    expectedDeliveryDate: { type: Date },
    currentLocation: { type: String },
    lastScan: { type: String },
    lastUpdated: { type: Date }
  }],
  
  // --- PRODUCTION FIX: Catch-all for legacy unique indexes ---
  paymentId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  transactionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
