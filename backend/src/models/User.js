import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  locality: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  landmark: { type: String },
  alternatePhone: { type: String },
  addressType: { type: String, enum: ['Home', 'Work'], default: 'Home' },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  dob: { type: Date },
  role: {
    type: String,
    enum: ['Customer', 'Staff', 'Manager', 'Super Admin'],
    default: 'Customer'
  },
  addresses: [addressSchema],
  fcmTokens: [{ type: String }],
  cart: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    selectedAttributes: { type: Object, default: {} }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
