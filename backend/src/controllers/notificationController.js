import Order from '../models/Order.js';
import RefundRequest from '../models/RefundRequest.js';
import Enquiry from '../models/Enquiry.js';
import StockNotification from '../models/StockNotification.js';
import Product from '../models/Product.js';

// GET /api/notifications — aggregated notifications for admin
export const getNotifications = async (req, res) => {
  try {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // New orders (Placed in last 7 days)
    const newOrders = await Order.find({ createdAt: { $gte: last7Days } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Shipped orders (last 7 days)
    const shippedOrders = await Order.find({ orderStatus: 'Shipped', updatedAt: { $gte: last7Days } })
      .populate('user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Delivered orders (last 7 days)
    const deliveredOrders = await Order.find({ orderStatus: 'Delivered', deliveredAt: { $gte: last7Days } })
      .populate('user', 'name email')
      .sort({ deliveredAt: -1 })
      .limit(10)
      .lean();

    // Pending refund requests
    const refundRequests = await RefundRequest.find({ status: 'Pending', createdAt: { $gte: last7Days } })
      .populate('user', 'name email')
      .populate('order', 'totalAmount')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Unread enquiries
    const enquiries = await Enquiry.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Pending stock notifications
    const stockNotifications = await StockNotification.find({ status: 'Pending', createdAt: { $gte: last7Days } })
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Build notification list
    const notifications = [];

    newOrders.forEach(o => {
      notifications.push({
        id: `order-new-${o._id}`,
        type: 'new_order',
        title: 'New Order Placed',
        message: `${o.user?.name || 'Customer'} placed an order worth ₹${o.totalAmount}`,
        time: o.createdAt,
        link: '/admin/orders',
        read: false
      });
    });

    shippedOrders.forEach(o => {
      notifications.push({
        id: `order-shipped-${o._id}`,
        type: 'order_shipped',
        title: 'Order Shipped',
        message: `Order #${o._id.toString().slice(-8).toUpperCase()} has been shipped to ${o.user?.name || 'customer'}`,
        time: o.updatedAt,
        link: '/admin/orders',
        read: false
      });
    });

    deliveredOrders.forEach(o => {
      notifications.push({
        id: `order-delivered-${o._id}`,
        type: 'order_delivered',
        title: 'Order Delivered',
        message: `Order #${o._id.toString().slice(-8).toUpperCase()} delivered to ${o.user?.name || 'customer'}`,
        time: o.deliveredAt,
        link: '/admin/orders',
        read: false
      });
    });

    refundRequests.forEach(r => {
      notifications.push({
        id: `refund-${r._id}`,
        type: 'refund_request',
        title: 'Refund Request',
        message: `${r.user?.name || 'Customer'} requested a refund of ₹${r.amount}`,
        time: r.createdAt,
        link: '/admin/refunds/pending',
        read: false
      });
    });

    enquiries.forEach(e => {
      notifications.push({
        id: `enquiry-${e._id}`,
        type: 'new_enquiry',
        title: 'New Enquiry',
        message: `${e.firstName} ${e.lastName}: "${e.message.slice(0, 60)}..."`,
        time: e.createdAt,
        link: '/admin/enquiries',
        read: false
      });
    });

    stockNotifications.forEach(sn => {
      notifications.push({
        id: `stock-${sn._id}`,
        type: 'stock_request',
        title: 'Restock Requested',
        message: `${sn.user?.name || 'A customer'} requested restock for ${sn.product?.name || 'a product'}`,
        time: sn.createdAt,
        link: '/admin/inventory',
        read: false
      });
    });

    // Sort by time desc
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      notifications: notifications.slice(0, 30),
      unreadCount: notifications.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new stock notification subscription
// @route   POST /api/notifications/stock
// @access  Private (Authenticated users)
export const createStockNotification = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock > 0) {
      return res.status(400).json({ success: false, message: 'Product is currently in stock' });
    }

    const existingNotification = await StockNotification.findOne({ product: productId, user: userId, status: 'Pending' });
    if (existingNotification) {
      return res.status(400).json({ success: false, message: 'You have already subscribed for notifications for this product' });
    }

    const newNotification = new StockNotification({
      user: userId,
      product: productId,
      email: req.user.email,
      status: 'Pending'
    });

    await newNotification.save();

    res.status(201).json({ success: true, message: 'You will be notified when this product is back in stock' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all stock notifications for Admin
// @route   GET /api/notifications/admin/stock
// @access  Private/Admin
export const getStockNotificationsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await StockNotification.countDocuments();
    const notifications = await StockNotification.find()
      .populate('user', 'name email')
      .populate('product', 'name images sku')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      notifications,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/notifications/badge-counts
export const getBadgeCounts = async (req, res) => {
  try {
    const ordersCount = await Order.countDocuments({ orderStatus: 'Placed' });
    const refundsCount = await RefundRequest.countDocuments({ status: 'Pending' });
    const enquiriesCount = await Enquiry.countDocuments({ isRead: false });
    
    res.json({
      success: true,
      counts: {
        orders: ordersCount,
        refunds: refundsCount,
        enquiries: enquiriesCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
