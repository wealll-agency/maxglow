import mongoose from 'mongoose';

const adjustmentSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  quantityChanged: { type: Number, required: true },
  type: {
    type: String,
    enum: ['Sale', 'Restock', 'AuditAdjustment', 'ExpiredDiscard'],
    required: true
  },
  reason: { type: String },
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10, min: 0 },
  adjustments: [adjustmentSchema]
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of product + batch combo
inventorySchema.index({ product: 1, batchNumber: 1 }, { unique: true });
inventorySchema.index({ stockQuantity: 1, lowStockThreshold: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
