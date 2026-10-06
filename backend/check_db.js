import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow';
    await mongoose.connect(uri);
    const db = mongoose.connection;
    const users = db.collection('users');

    // Check if maxglow2026@admin.com exists
    const adminUser = await users.findOne({ email: 'maxglow2026@admin.com' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Max@Glow@2026', salt);

    if (adminUser) {
      await users.updateOne({ _id: adminUser._id }, { $set: { password: hashedPassword, role: 'Super Admin' } });
      console.log('Password reset successfully for maxglow2026@admin.com');
    } else {
      await users.insertOne({
        name: 'MaxGlow Admin',
        email: 'maxglow2026@admin.com',
        password: hashedPassword,
        phone: '9999999999',
        role: 'Super Admin'
      });
      console.log('Admin user created successfully.');
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
