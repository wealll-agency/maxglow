import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import mongoose from 'mongoose';
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const latestOrder = await Order.findOne({ shipments: { $ne: [] } }).sort({ createdAt: -1 });
  console.log(JSON.stringify(latestOrder?.shipments, null, 2));
  process.exit(0);
});
