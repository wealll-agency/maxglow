import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import Order from './src/models/Order.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Inventory from './src/models/Inventory.js';

const testDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
    
    console.log('1. Testing total sales aggregation...');
    await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    
    console.log('2. Testing Total Customers...');
    await User.countDocuments({ role: 'Customer' });
    
    console.log('3. Testing Low Stock Items count...');
    await Inventory.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    });
    
    console.log('4. Testing Total Products...');
    await Product.countDocuments();
    
    console.log('5. Testing Order Statuses...');
    await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('6. Testing Admin Wallet Stats...');
    await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalDeliveryCharge: { $sum: '$shippingFee' },
          totalTaxCollected: { $sum: '$tax' }
        }
      }
    ]);
    await Order.aggregate([
      { $match: { paymentStatus: 'Pending', orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, pendingAmount: { $sum: '$totalAmount' } } }
    ]);
    
    console.log('7. Testing Monthly Sales...');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          orderStatus: { $ne: 'Cancelled' },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    console.log('8. Testing Top Products...');
    const topProductsAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenueGenerated: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 }
    ]);
    console.log('Top Products Aggregation result:', topProductsAggregation);

    const topProducts = [];
    for (const prod of topProductsAggregation) {
      console.log('Checking prod:', prod._id);
      const pDetail = await Product.findById(prod._id).select('images');
      topProducts.push({
        ...prod,
        image: pDetail?.images[0] || ''
      });
    }
    console.log('Top Products populated successfully');
    
    console.log('9. Testing Low Stock Details...');
    await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    }).populate('product', 'name category price').limit(5);

    console.log('All tests passed successfully.');
  } catch (error) {
    console.error('ERROR ENCOUNTERED:', error);
  } finally {
    process.exit(0);
  }
};

testDashboard();
