import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import SystemSetting from '../models/SystemSetting.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import { logActivity } from '../middleware/logger.js';

// CCAvenue configuration will be drawn directly from environment variables

// Helper: Calculate order totals
const calculateOrderTotals = async (items, couponCode) => {
  let subtotal = 0;
  
  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});

  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product)) {
      const err = new Error(`Invalid product ID format for: ${item.name}`);
      err.statusCode = 400;
      throw err;
    }
    const product = productMap[item.product.toString()];
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }
    
    // Check stock
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }
    
    let basePrice = product.price;
    // Check if a specific pack size was selected
    if (item.size && product.packSizes && product.packSizes.length > 0) {
      const selectedPack = product.packSizes.find(
        p => `${p.weight} ${p.unit}` === item.size
      );
      if (selectedPack) {
        basePrice = selectedPack.price;
      } else if (item.size !== `${product.unitValue || 1} ${product.unit || 'Pack'}`) {
        throw new Error(`Invalid pack size selected for: ${item.name}`);
      }
    }
    
    const activePrice = product.discount > 0 
      ? (product.discountType === 'Percent' ? Math.round(basePrice * (1 - product.discount / 100)) : Math.max(0, basePrice - product.discount))
      : basePrice;
      
    subtotal += activePrice * item.quantity;
    item.price = activePrice; // Bind exact price paid
  }

  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon && coupon.isValid()) {
      discount = Math.round((subtotal * coupon.discountPercentage) / 100);
    }
  }

  // Tax = 5% of discounted price
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.05);
  
  // Shipping: Free above 500, else 40 INR
  const shippingFee = taxableAmount > 500 ? 0 : 40;
  
  const totalAmount = taxableAmount + tax + shippingFee;

  return { subtotal, discount, tax, shippingFee, totalAmount, validatedItems: items };
};

// @desc    Create a new order & initiate Razorpay payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, deliveryAddress, couponCode, paymentMode = 'CCAvenue' } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (paymentMode === 'COD') {
      const codSetting = await SystemSetting.findOne({ key: 'cod' });
      const hasCodPermission = codSetting ? codSetting.value : true;
      if (!hasCodPermission) {
        return res.status(403).json({ success: false, message: 'Cash on Delivery (COD) is currently disabled globally.' });
      }
    }

    const { subtotal, discount, tax, shippingFee, totalAmount, validatedItems } = await calculateOrderTotals(items, couponCode);

    // 1. Create Local Order (Pending Payment)
    const mappedDeliveryAddress = {
      name: deliveryAddress?.name || req.user?.name || 'Customer',
      phone: deliveryAddress?.phone || req.user?.phone || '9999999999',
      pincode: deliveryAddress?.pincode || deliveryAddress?.zipCode || '',
      locality: deliveryAddress?.locality || deliveryAddress?.street || deliveryAddress?.address || deliveryAddress?.city || '',
      address: deliveryAddress?.address || deliveryAddress?.street || deliveryAddress?.locality || '',
      city: deliveryAddress?.city || '',
      state: deliveryAddress?.state || '',
      landmark: deliveryAddress?.landmark || '',
      alternatePhone: deliveryAddress?.alternatePhone || deliveryAddress?.phone || req.user?.phone || '',
      addressType: deliveryAddress?.addressType || 'Home'
    };

    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      deliveryAddress: mappedDeliveryAddress,
      couponCode,
      couponDiscount: discount,
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      paymentMode,
      paymentStatus: 'Pending',
      orderStatus: 'Placed'
    });

    const savedOrder = await order.save();

    // 2. Reduce Stock in Inventory & Product Collections
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } }, { runValidators: true });
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { 
          $inc: { stockQuantity: -item.quantity },
          $push: {
            adjustments: {
              quantityChanged: -item.quantity,
              type: 'Sale',
              reason: `Order Placement (Local ID: ${savedOrder._id})`,
              adjustedBy: req.user._id
            }
          }
        },
        { runValidators: true }
      );
    }

    // Increment Coupon usages if code was valid
    if (couponCode && discount > 0) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usageCount: 1 } }
      );
    }

    // If COD, we can skip CCAvenue processing
    if (paymentMode === 'COD') {
      await Payment.create({
        order: savedOrder._id,
        razorpayOrderId: `COD-${savedOrder._id}`,
        amount: totalAmount,
        status: 'Created',
        paymentMode: 'COD'
      });

      await logActivity(req.user._id, 'CREATE_ORDER', `Created COD order ID: ${savedOrder._id}`, req);

      return res.status(201).json({
        success: true,
        order: savedOrder,
        message: 'Order placed successfully'
      });
    }

    // 3. Create Payment ledger record for Razorpay
    const payment = await Payment.create({
      order: savedOrder._id,
      razorpayOrderId: 'pending', // Will update below
      amount: totalAmount,
      status: 'Created',
      paymentMode: paymentMode
    });

    // 4. Prepare Razorpay Payload
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock',
    });

    const options = {
      amount: Math.round(totalAmount * 100), // paise
      currency: 'INR',
      receipt: savedOrder._id.toString(),
      payment_capture: 1
    };

    const rzpOrder = await razorpay.orders.create(options);

    payment.razorpayOrderId = rzpOrder.id;
    await payment.save();

    savedOrder.razorpayOrderId = rzpOrder.id;
    await savedOrder.save();

    await logActivity(req.user._id, 'CREATE_ORDER', `Created order ID: ${savedOrder._id}, initiating Razorpay transaction`, req);

    res.status(201).json({
      success: true,
      order: savedOrder,
      razorpayOrderId: rzpOrder.id,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/verify-payment
// @access  Public
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(200).json({ success: true, message: 'Order already paid' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_mock';

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (generated_signature === razorpay_signature) {
      order.paymentStatus = 'Paid';
      order.orderStatus = 'Confirmed';
      order.confirmedAt = Date.now();
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      if (payment) {
        payment.status = 'Captured';
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        await payment.save();
      }

      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Payment Failed Signature Mismatch
      order.paymentStatus = 'Failed';
      await order.save();

      if (payment) {
        payment.status = 'Failed';
        payment.failureMessage = 'Signature mismatch';
        await payment.save();
      }

      // Restore Stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Payment Verification Failure Stock Restoral (Order ID: ${order._id})`,
                adjustedBy: order.user
              }
            }
          },
          { runValidators: true }
        );
      }

      return res.status(400).json({ success: false, message: 'Payment verification failed (Signature Mismatch)' });
    }
  } catch (error) {
    console.error('Razorpay Verification Error:', error);
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'images name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'images name')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow customer to fetch their own orders, or Staff/Manager/Admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'Customer') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin views)
// @route   GET /api/orders
// @access  Private/Admin/Manager/Staff
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Manager/Staff
export const updateOrderStatus = async (req, res, next) => {
  const { status, trackingNumber } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restrict cancellation if already shipped/delivered
    if (status === 'Cancelled' && ['Shipped', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel order that has already been shipped or delivered' });
    }

    const updateQuery = { $set: {} };
    updateQuery.$set.orderStatus = status || order.orderStatus;
    
    if (trackingNumber) updateQuery.$set.trackingNumber = trackingNumber;
    
    if (status === 'Confirmed') updateQuery.$set.confirmedAt = Date.now();
    if (status === 'Packed') updateQuery.$set.packedAt = Date.now();
    if (status === 'Shipped') updateQuery.$set.shippedAt = Date.now();
    if (status === 'Delivered') updateQuery.$set.deliveredAt = Date.now();

    // If Order is Cancelled, restore items to stock
    if (status === 'Cancelled') {
      updateQuery.$set.paymentStatus = 'Refunded';
      
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { runValidators: true });
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { 
            $inc: { stockQuantity: item.quantity },
            $push: {
              adjustments: {
                quantityChanged: item.quantity,
                type: 'AuditAdjustment',
                reason: `Order Cancellation (ID: ${order._id})`,
                adjustedBy: req.user._id
              }
            }
          },
          { runValidators: true }
        );
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateQuery, { new: true });
    await logActivity(req.user._id, 'UPDATE_ORDER_STATUS', `Updated order ID ${order._id} status to: ${status}`, req);

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
export const processRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Order cannot be refunded because it is not in Paid status' });
    }

    const payment = await Payment.findOne({ order: order._id });

    if (!payment) {
      return res.status(400).json({ success: false, message: 'Transaction record missing' });
    }

    // CCAvenue refunds are typically initiated from the merchant dashboard manually
    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: 'MANUAL_CCAVENUE_REFUND_' + Date.now(),
      amount: order.totalAmount,
      reason: 'Admin Initiated Refund',
      processedAt: new Date()
    };
    await payment.save();

    const updateQuery = {
      $set: {
        paymentStatus: 'Refunded',
        orderStatus: 'Cancelled'
      }
    };
    await Order.findByIdAndUpdate(order._id, updateQuery);

    await logActivity(req.user._id, 'PROCESS_REFUND', `Processed manual refund record for Order ID ${order._id}`, req);

    res.json({ success: true, message: 'Refund recorded successfully. Note: You must actually initiate the refund in your CCAvenue Dashboard.', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shipments for admin panel
// @route   GET /api/orders/shipments
// @access  Private/Admin
export const getAdminShipments = async (req, res, next) => {
  try {
    const { pageNumber, keyword, status } = req.query;
    const page = Number(pageNumber) || 1;
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    const pipeline = [
      { $match: { 'shipments.0': { $exists: true } } },
      { $unwind: '$shipments' },
      { 
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          orderIdStr: { $toString: '$_id' }
        }
      },
      ...(status ? [{ $match: { 'shipments.status': status } }] : []),
      ...(keyword ? [{
        $match: {
          $or: [
            { 'shipments.waybill': { $regex: keyword, $options: 'i' } },
            { 'shipments.trackingId': { $regex: keyword, $options: 'i' } },
            { 'userDetails.name': { $regex: keyword, $options: 'i' } },
            { 'userDetails.phone': { $regex: keyword, $options: 'i' } },
            { 'deliveryAddress.phone': { $regex: keyword, $options: 'i' } },
            { 'orderIdStr': { $regex: keyword, $options: 'i' } }
          ]
        }
      }] : []),
      {
        $lookup: {
          from: 'warehouses',
          localField: 'shipments.warehouse',
          foreignField: '_id',
          as: 'warehouseDetails'
        }
      },
      { $unwind: { path: '$warehouseDetails', preserveNullAndEmptyArrays: true } },
      { $sort: { 'shipments.shippedAt': -1, createdAt: -1 } },
      {
        $project: {
          _id: '$shipments._id',
          orderId: '$_id',
          customerName: { $ifNull: ['$userDetails.name', 'Guest'] },
          customerEmail: '$userDetails.email',
          deliveryAddress: '$deliveryAddress',
          orderDate: '$createdAt',
          paymentStatus: '$paymentStatus',
          waybill: '$shipments.waybill',
          trackingId: '$shipments.trackingId',
          status: '$shipments.status',
          courierName: '$shipments.courierName',
          shippedAt: '$shipments.shippedAt',
          warehouse: {
            _id: '$warehouseDetails._id',
            name: '$warehouseDetails.name',
            delhiveryPickupLocationName: '$warehouseDetails.delhiveryPickupLocationName'
          }
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: skip }, { $limit: pageSize }]
        }
      }
    ];

    const result = await Order.aggregate(pipeline);
    
    const count = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const paginatedShipments = result[0].data;

    res.json({
      shipments: paginatedShipments,
      page,
      pages: Math.ceil(count / pageSize),
      totalShipments: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shipment details by waybill
// @route   GET /api/orders/shipments/:waybill
// @access  Private/Admin
export const getShipmentByWaybill = async (req, res, next) => {
  try {
    const { waybill } = req.params;
    const order = await Order.findOne({ 'shipments.waybill': waybill })
      .populate('user', 'name email phone')
      .populate('items.product', 'name sku price images category')
      .populate('shipments.warehouse', 'name address city state pincode phone delhiveryPickupLocationName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Shipment not found' });
    }

    const shipment = order.shipments.find(s => s.waybill === waybill);

    res.json({
      success: true,
      order: {
        _id: order._id,
        createdAt: order.createdAt,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        deliveryAddress: order.deliveryAddress,
        items: order.items,
        user: order.user,
        totalAmount: order.totalAmount
      },
      shipment
    });
  } catch (error) {
    next(error);
  }
};
