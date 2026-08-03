import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import Coupon from './src/models/Coupon.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function testAnalyticsQuery() {
  await mongoose.connect(uri);
  const coupon = await Coupon.findOne({ code: 'OPE10' });
  console.log('Coupon:', coupon.code, coupon._id);

  const couponCode = coupon.code.toUpperCase().trim();
  const escapedCode = couponCode.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const matchCriteria = {
    couponCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') }
  };

  const [summary, states, cities, pincodes, areas] = await Promise.all([
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: null, totalUses: { $sum: 1 }, totalDiscount: { $sum: '$couponDiscount' }, totalRevenue: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$deliveryAddress.state', uses: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$deliveryAddress.city', uses: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$deliveryAddress.pincode', uses: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$deliveryAddress.locality', uses: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ])
  ]);

  console.log('SUMMARY:', summary);
  console.log('STATES:', states);
  console.log('CITIES:', cities);
  console.log('PINCODES:', pincodes);
  console.log('AREAS:', areas);

  process.exit(0);
}

testAnalyticsQuery().catch(err => { console.error(err); process.exit(1); });
