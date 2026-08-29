import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin/Manager
export const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {};

    const payments = await Payment.find(query)
      .populate({
        path: 'order',
        select: 'deliveryAddress items totalAmount paymentStatus orderStatus user',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching payments' });
  }
};

// @desc    Mark COD payment as paid/captured
// @route   PUT /api/payments/:id/mark-paid
// @access  Private/Admin/Manager
export const markPaymentAsPaid = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.paymentMode !== 'COD') {
      return res.status(400).json({ success: false, message: 'Only COD payments can be manually marked as paid' });
    }

    if (payment.status === 'Captured') {
      return res.status(400).json({ success: false, message: 'Payment is already captured' });
    }

    payment.status = 'Captured';
    await payment.save();

    // Also update the associated order
    if (payment.order) {
      const order = await Order.findById(payment.order);
      if (order && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        await order.save();
      }
    }

    res.json({
      success: true,
      message: 'Payment marked as received successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating payment status' });
  }
};
