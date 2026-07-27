import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  ccavenueOrderId: { type: String, required: true, unique: true },
  ccavenueTrackingId: { type: String },
  ccavenueBankRefNo: { type: String },
  paymentMode: { type: String },
  encResponse: { type: String },
  failureMessage: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['Created', 'Captured', 'Failed', 'Refunded'],
    default: 'Created'
  },
  refundDetails: {
    refundId: { type: String },
    amount: { type: Number },
    reason: { type: String },
    processedAt: { type: Date }
  },
  // --- PRODUCTION FIX: Catch-all for legacy unique indexes ---
  paymentId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  orderId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  transactionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
