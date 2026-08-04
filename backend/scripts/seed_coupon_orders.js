import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(uri);
  console.log('DB Connected for Coupon Orders Seeder');

  const adminUser = await User.findOne({ role: 'Super Admin' });
  const sampleProduct = await Product.findOne();

  if (!adminUser || !sampleProduct) {
    console.log('Missing adminUser or sampleProduct in DB');
    process.exit(1);
  }

  const sampleOrders = [
    {
      user: adminUser._id,
      items: [{ product: sampleProduct._id, name: sampleProduct.name, quantity: 2, price: 240 }],
      deliveryAddress: {
        name: 'Rahul Sen',
        phone: '9830123456',
        pincode: '700001',
        locality: 'Bada Bazaar, Burrabazar',
        address: '12 Maharshi Devendra Road',
        city: 'Kolkata',
        state: 'West Bengal',
        addressType: 'Home'
      },
      couponCode: 'OPE10',
      couponDiscount: 48,
      subtotal: 480,
      shippingFee: 0,
      tax: 21,
      totalAmount: 432,
      paymentMode: 'Razorpay',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      user: adminUser._id,
      items: [{ product: sampleProduct._id, name: sampleProduct.name, quantity: 1, price: 500 }],
      deliveryAddress: {
        name: 'Priyanka Das',
        phone: '9830987654',
        pincode: '700102',
        locality: 'Salt Lake Sector 1',
        address: 'Block AB 14',
        city: 'Kolkata',
        state: 'West Bengal',
        addressType: 'Work'
      },
      couponCode: 'OPE10',
      couponDiscount: 50,
      subtotal: 500,
      shippingFee: 0,
      tax: 21,
      totalAmount: 450,
      paymentMode: 'COD',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      user: adminUser._id,
      items: [{ product: sampleProduct._id, name: sampleProduct.name, quantity: 3, price: 300 }],
      deliveryAddress: {
        name: 'Amitabh Sharma',
        phone: '9820112233',
        pincode: '400001',
        locality: 'Fort, Marine Drive',
        address: '45 Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        addressType: 'Home'
      },
      couponCode: 'OPE10',
      couponDiscount: 90,
      subtotal: 900,
      shippingFee: 0,
      tax: 39,
      totalAmount: 810,
      paymentMode: 'Razorpay',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      createdAt: new Date()
    },
    {
      user: adminUser._id,
      items: [{ product: sampleProduct._id, name: sampleProduct.name, quantity: 1, price: 660 }],
      deliveryAddress: {
        name: 'Kautav Mukherjee',
        phone: '9123007844',
        pincode: '712234',
        locality: 'Rammahan Place, Konnagar',
        address: '77/33 Rammahan Place',
        city: 'Kolkata',
        state: 'West Bengal',
        addressType: 'Home'
      },
      couponCode: 'OPE10',
      couponDiscount: 66,
      subtotal: 660,
      shippingFee: 0,
      tax: 28,
      totalAmount: 594,
      paymentMode: 'Razorpay',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      createdAt: new Date()
    }
  ];

  const created = await Order.insertMany(sampleOrders);
  console.log(`Successfully seeded ${created.length} orders with couponCode OPE10!`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
