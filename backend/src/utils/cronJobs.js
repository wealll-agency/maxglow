import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';

// Revert stock for abandoned pending orders (older than 30 minutes)
export const cleanupAbandonedOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const abandonedOrders = await Order.find({
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      paymentMode: { $ne: 'COD' },
      createdAt: { $lt: thirtyMinutesAgo }
    });

    for (const order of abandonedOrders) {
      // Claim the order atomically
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          paymentStatus: 'Pending',
          orderStatus: 'Placed'
        },
        {
          $set: {
            paymentStatus: 'Failed',
            orderStatus: 'Cancelled'
          }
        },
        { new: true }
      );

      if (!updatedOrder) {
        console.log(`[Cron] Order ${order._id} already claimed or processed by another worker node.`);
        continue;
      }

      console.log(`[Cron] Cancelling abandoned order ${order._id}`);
      
      // Update payment ledger
      const payment = await Payment.findOne({ order: order._id });
      if (payment && payment.status === 'Created') {
        payment.status = 'Failed';
        payment.failureMessage = 'Order abandoned by user (Timeout)';
        await payment.save();
      }

      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true });
        
        // Find latest batch for the product and increment stock
        const batch = await Inventory.findOne({ product: item.product }).sort({ expiryDate: -1 });
        if (batch) {
          batch.stockQuantity += item.quantity;
          batch.adjustments.push({
            quantityChanged: item.quantity,
            type: 'AuditAdjustment',
            reason: `Abandoned Order Timeout Stock Restoral (Order ID: ${order._id})`,
            adjustedBy: order.user
          });
          await batch.save();
        }
      }
    }
  } catch (error) {
    console.error('[Cron] Error cleaning up abandoned orders:', error);
  }
};

export const initCronJobs = () => {
  // Run every 15 minutes
  setInterval(cleanupAbandonedOrders, 15 * 60 * 1000).unref();
  console.log('Cron jobs initialized.');
};
