import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String, default: '', index: true },
  subSubCategory: { type: String, default: '' },
  brand: { type: String, default: '', index: true },
  productType: { type: String, enum: ['Physical', 'Digital'], default: 'Physical' },
  sku: { type: String, default: '' },
  unit: { type: String, default: 'kg' },
  unitValue: { type: Number, default: 1 },
  searchTags: [{ type: String }],
  
  price: { type: Number, required: true, min: 0 }, // This represents Unit Price
  purchasePrice: { type: Number, default: 0, min: 0 },
  minOrderQty: { type: Number, default: 1, min: 1 },
  discount: { type: Number, default: 0, min: 0 }, // Represents Discount Amount
  discountType: { type: String, enum: ['Flat', 'Percent'], default: 'Flat' },
  taxAmount: { type: Number, default: 0, min: 0 },
  taxCalculation: { type: String, enum: ['Include with product', 'Exclude'], default: 'Include with product' },
  shippingCost: { type: Number, default: 0, min: 0 },
  shippingMultiplyWithQty: { type: Boolean, default: false },
  
  packSizes: [{
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
  
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
  showOnHomepage: { type: Boolean, default: true },
  showInReels: { type: Boolean, default: false },
  manualTopSelling: { type: Boolean, default: false },
  healthyProduct: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  totalSold: { type: Number, default: 0 },
  
  description: { type: String, required: true },
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  images: [{ type: String }],
  videos: [{ type: String }],
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
}, {
  timestamps: true
});

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    if (this.discountType === 'Percent') {
      return Math.round(this.price * (1 - this.discount / 100));
    } else {
      return Math.max(0, this.price - this.discount);
    }
  }
  return this.price;
});

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Create text index for search
productSchema.index({ name: 'text', category: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ showOnHomepage: 1, stock: 1 });
productSchema.index({ newArrival: 1, stock: 1 });
productSchema.index({ isFeatured: 1, stock: 1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ category: 1, stock: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
