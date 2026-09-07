import mongoose from 'mongoose';

const comboComponentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Denormalized for easier rendering
  size: { type: String, required: true }, // E.g., '250 g' or 'Standard' to match cartSlice logic
  quantity: { type: Number, required: true, min: 1 },
  label: { type: String, default: '' } // Optional label like 'Free Gift' or 'Main Item'
}, { _id: false });

const comboSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  benefits: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  sku: { type: String, default: '' },
  category: { type: String, default: 'Combo' },
  brand: { type: String, default: 'MaxGlow' },
  
  comboPrice: { type: Number, required: true, min: 0 },
  
  image: { type: String, default: '' },
  images: [{ type: String }],
  
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Inactive', 'Archived'],
    default: 'Draft',
    index: true
  },
  
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
  
  components: [comboComponentSchema]
}, {
  timestamps: true
});

// Virtual to calculate total regular price of the combo on the fly
comboSchema.virtual('regularTotal').get(function () {
  // This virtual requires components.product to be populated to work correctly.
  let total = 0;
  if (this.components && this.components.length > 0) {
    this.components.forEach(comp => {
      if (comp.product && typeof comp.product === 'object' && comp.product.price !== undefined) {
        // If product has packSizes, find the one matching 'size'
        let basePrice = comp.product.price;
        if (comp.product.packSizes && comp.product.packSizes.length > 0) {
          const pack = comp.product.packSizes.find(p => `${p.weight} ${p.unit}` === comp.size);
          if (pack) {
            basePrice = pack.price;
          }
        }
        
        total += basePrice * comp.quantity;
      }
    });
  }
  return total;
});

// Ensure virtuals are serialized
comboSchema.set('toJSON', { virtuals: true });
comboSchema.set('toObject', { virtuals: true });

// Text indexing for search
comboSchema.index({ name: 'text', description: 'text', sku: 'text' });
comboSchema.index({ createdAt: -1 });

const Combo = mongoose.model('Combo', comboSchema);
export default Combo;
