import RefundRequest from '../models/RefundRequest.js';
import Order from '../models/Order.js';
import SystemSetting from '../models/SystemSetting.js';

// @desc    Get all refund requests (with optional status filter)
// @route   GET /api/refunds
// @access  Private/Admin
export const getRefundRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const refunds = await RefundRequest.find(filter)
      .populate('user', 'name email phone')
      .populate({
        path: 'order',
        select: 'items totalAmount paymentStatus trackingNumber orderStatus',
        populate: {
          path: 'items.product',
          select: 'name price image'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, refunds });
  } catch (error) {
    next(error);
  }
};

// @desc    Update refund request status
// @route   PUT /api/refunds/:id/status
// @access  Private/Admin
export const updateRefundStatus = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;
    const refund = await RefundRequest.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    refund.status = status || refund.status;
    if (adminComment) {
      refund.adminComment = adminComment;
    }

    await refund.save();

    // If marked as refunded, also update the order payment status
    if (status === 'Refunded') {
      const order = await Order.findById(refund.order);
      if (order) {
        order.paymentStatus = 'Refunded';
        await order.save();
      }
    }

    const updatedRefund = await RefundRequest.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('order', 'items totalAmount paymentStatus trackingNumber orderStatus');

    res.json({ success: true, refund: updatedRefund });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a mock refund request (for testing/development)
// @route   POST /api/refunds/mock
// @access  Private/Admin
export const createMockRefundRequest = async (req, res, next) => {
  try {
    const { orderId, userId, reason, amount, customerComment, status } = req.body;
    
    const refund = new RefundRequest({
      order: orderId,
      user: userId,
      reason,
      amount,
      customerComment,
      status: status || 'Pending'
    });

    await refund.save();
    res.status(201).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a refund/cancel request by customer
// @route   POST /api/refunds/request/:orderId
// @access  Private
export const createCustomerRefundRequest = async (req, res, next) => {
  try {
    const { reason, customerComment } = req.body;
    const orderId = req.params.orderId;

    const refundSetting = await SystemSetting.findOne({ key: 'refund' });
    const hasRefundPermission = refundSetting ? refundSetting.value : true;
    if (!hasRefundPermission) {
      return res.status(403).json({ success: false, message: 'Refund requests are currently disabled globally.' });
    }
    
    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if refund request already exists
    const existingRequest = await RefundRequest.findOne({ order: orderId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'A request for this order already exists' });
    }

    // If order is not shipped, we can directly cancel it (and still create the refund request if paid)
    // For simplicity, we just create a refund request and let admin handle the rest.
    if (order.orderStatus === 'Placed' || order.orderStatus === 'Confirmed') {
        order.orderStatus = 'Cancelled';
        await order.save();
    } else if (order.orderStatus === 'Packed' || order.orderStatus === 'Shipped') {
        return res.status(400).json({ success: false, message: 'Your order is already packed or in transit and cannot be cancelled. You can request a refund once it is delivered.' });
    }

    const refund = new RefundRequest({
      order: orderId,
      user: req.user._id,
      reason: reason || 'Customer Request',
      customerComment,
      amount: order.totalAmount,
      status: 'Pending'
    });

    await refund.save();
    res.status(201).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};

