import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  flatDiscountAmount: { type: Number, default: 0, min: 0 },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  isCombo: { type: Boolean, default: false },
  minOrderValue: { type: Number, default: 0, min: 0 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

// Check if coupon is valid helper
couponSchema.methods.isValid = function () {
  return this.isActive && this.expiryDate > new Date() && this.usageCount < this.usageLimit;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
