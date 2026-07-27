import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config({ path: '../.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'maxglow2026@gmail.com' });
  if (user) {
    console.log('User found:', user.email);
    const isMatch = await user.matchPassword('MaxGlow@2026');
    console.log('Password match:', isMatch);
  } else {
    console.log('User not found');
  }
  process.exit();
}

check();
