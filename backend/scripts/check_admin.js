import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String
}, { strict: false });

const User = mongoose.model('User', userSchema, 'users');

async function checkAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maxglow');
  const user = await User.findOne({ email: 'maxglow2026@admin.com' });
  console.log(user);
  process.exit(0);
}

checkAdmin();
