import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
}, { strict: false });

const User = mongoose.model('User', userSchema, 'users');

async function fixAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maxglow');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Maxglow@2026', salt);
  await User.updateOne({ email: 'maxglow2026@admin.com' }, { $set: { password: hashedPassword } });
  console.log('Password successfully reset for maxglow2026@admin.com');
  process.exit(0);
}

fixAdmin();
