import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Combo from '../models/Combo.js';

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

      // Restore coupon usage count
      if (order.couponCode && order.couponDiscount > 0) {
        await import('../models/Coupon.js').then(async ({ default: Coupon }) => {
          await Coupon.findOneAndUpdate(
            { code: order.couponCode.toUpperCase() },
            { $inc: { usageCount: -1 } }
          );
        }).catch(err => console.error('[Cron] Failed to restore coupon count:', err));
      }

      // Restore stock
      for (const item of order.items) {
        if (item.itemType === 'Combo') {
          const combo = await Combo.findById(item.combo).lean();
          if (combo && combo.components) {
            for (const comp of combo.components) {
              const restoreQty = comp.quantity * item.quantity;
              await Product.findByIdAndUpdate(comp.product, { $inc: { stock: restoreQty, totalSold: -restoreQty } }, { runValidators: true });
              
              const batch = await Inventory.findOne({ product: comp.product }).sort({ expiryDate: -1 });
              if (batch) {
                batch.stockQuantity += restoreQty;
                batch.adjustments.push({
                  quantityChanged: restoreQty,
                  type: 'AuditAdjustment',
                  reason: `Abandoned Order Timeout Stock Restoral (Combo) (Order ID: ${order._id})`,
                  adjustedBy: order.user
                });
                await batch.save();
              }
            }
          }
        } else {
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
