import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';

async function run() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/maxglow';
    await mongoose.connect(uri);
    const db = mongoose.connection;
    const refundRequests = db.collection('refundrequests');
    const orders = db.collection('orders');

    // order ID: 6ac4c5aac566934ebd2faa9b
    const orderId = new mongoose.Types.ObjectId('6ac4c5aac566934ebd2faa9b');

    // Find and delete the refund request
    const result = await refundRequests.deleteOne({ order: orderId });
    console.log(`Deleted ${result.deletedCount} refund request(s) for order 6ac4c5aac566934ebd2faa9b`);

    // Also remove the refund request reference from the order, if applicable
    await orders.updateOne(
      { _id: orderId },
      { $unset: { refundRequest: "" }, $set: { status: "Delivered" } } // assuming status goes back to Delivered, or whatever it was
    );

    console.log('Done.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
