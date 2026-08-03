import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import Coupon from './src/models/Coupon.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function run() {
  console.log('Connecting to DB...');
  await mongoose.connect(uri);
  console.log('--- DATABASE COUPON CHECK ---');
  
  const coupons = await Coupon.find().lean();
  console.log('Found Coupons in DB:', coupons.map(c => ({ code: c.code, usageCount: c.usageCount, usageLimit: c.usageLimit })));

  const orders = await Order.find().select('couponCode couponDiscount totalAmount deliveryAddress orderStatus createdAt').lean();
  console.log('Total Orders in DB:', orders.length);
  
  const ordersWithCoupons = orders.filter(o => o.couponCode);
  console.log('Orders with couponCode:', ordersWithCoupons.length);
  ordersWithCoupons.forEach(o => {
    console.log(`Order ID: ${o._id} | Code: "${o.couponCode}" | Discount: ₹${o.couponDiscount} | Total: ₹${o.totalAmount} | Locality: "${o.deliveryAddress?.locality}" | Pincode: "${o.deliveryAddress?.pincode}" | City: "${o.deliveryAddress?.city}" | State: "${o.deliveryAddress?.state}"`);
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
