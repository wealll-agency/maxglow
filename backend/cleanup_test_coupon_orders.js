import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function cleanup() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const result = await Order.deleteMany({
    _id: {
      $in: [
        '6a6de40d2633dc0a0223c801',
        '6a6de40d2633dc0a0223c806',
        '6a6de40d2633dc0a0223c80b',
        '6a6de40d2633dc0a0223c810'
      ]
    }
  });

  console.log(`Successfully removed ${result.deletedCount} test seeded orders from database!`);
  
  // Verify remaining real orders
  const remainingOrders = await Order.find().select('_id couponCode deliveryAddress totalAmount orderStatus').lean();
  console.log('Total Remaining Real Orders in DB:', remainingOrders.length);
  remainingOrders.forEach(o => {
    console.log(`Real Order: ${o._id} | Code: ${o.couponCode || 'None'} | City: ${o.deliveryAddress?.city || 'N/A'} | Total: ₹${o.totalAmount}`);
  });

  process.exit(0);
}

cleanup().catch(err => {
  console.error(err);
  process.exit(1);
});
