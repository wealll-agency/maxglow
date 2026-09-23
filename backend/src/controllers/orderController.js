import mongoose from 'mongoose';
import crypto from 'crypto';
import { generateICICISecureHash, verifyICICISecureHash, processICICIRefund } from '../services/iciciService.js';
import axios from 'axios';
import Order from '../models/Order.js';
import SystemSetting from '../models/SystemSetting.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Payment from '../models/Payment.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Combo from '../models/Combo.js';

import { logActivity } from '../middleware/logger.js';

// CCAvenue/Razorpay configuration removed. Using ICICI configuration.

// Helper: Calculate order totals
const calculateOrderTotals = async (items, couponCode) => {
  let subtotal = 0;
  
  const productIds = items.filter(i => i.itemType !== 'Combo').map(item => item.product);
  const comboIds = items.filter(i => i.itemType === 'Combo').map(item => item.combo);
  
  const products = await Product.find({ _id: { $in: productIds } }).select('name price stock images discount discountType attributes packSizes isActive').lean();
  const productMap = products.reduce((acc, product) => {
    acc[product._id.toString()] = product;
    return acc;
  }, {});

  const combos = await Combo.find({ _id: { $in: comboIds } }).select('name comboPrice status components').lean();
  const comboMap = combos.reduce((acc, combo) => {
    acc[combo._id.toString()] = combo;
    return acc;
  }, {});

  for (const item of items) {
    if (item.itemType === 'Combo') {
      if (!mongoose.isValidObjectId(item.combo)) {
        const err = new Error(`Invalid combo ID format for: ${item.name}`);
        err.statusCode = 400;
        throw err;
      }
      const combo = comboMap[item.combo.toString()];
      if (!combo) {
        throw new Error(`Combo not found: ${item.name}`);
      }
      if (combo.status !== 'Active') {
        throw new Error(`Combo ${combo.name} is currently inactive.`);
      }
      let activePrice = combo.comboPrice;
      subtotal += activePrice * item.quantity;
      item.price = activePrice;
    } else {
      if (!mongoose.isValidObjectId(item.product)) {
        const err = new Error(`Invalid product ID format for: ${item.name}`);
        err.statusCode = 400;
        throw err;
      }
      const product = productMap[item.product.toString()];
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }
      
      if (product.isActive === false) {
        throw new Error(`Product ${product.name} is currently unavailable.`);
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
        }
      }
      
      let activePrice = basePrice;
      if (product.discount > 0) {
        activePrice = product.discountType === 'Percent' 
          ? Math.round(basePrice * (1 - product.discount / 100)) 
          : Math.max(0, basePrice - product.discount);
      }
        
      subtotal += activePrice * item.quantity;
      item.price = activePrice; // Bind exact price paid
    }
  }

  let discountableSubtotal = 0;
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
    if (!coupon) {
      const err = new Error('Coupon code not found');
      err.statusCode = 404;
      throw err;
    }
    if (!coupon.isValid()) {
      const err = new Error('Coupon is expired, inactive, or has reached its usage limit');
      err.statusCode = 400;
      throw err;
    }
    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
      const err = new Error(`Order subtotal (₹${subtotal}) is below the minimum required spend of ₹${coupon.minOrderValue} for coupon ${coupon.code}`);
      err.statusCode = 400;
      throw err;
    }

    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      items.forEach(item => {
        if (coupon.applicableProducts.some(p => p.toString() === item.product.toString())) {
          discountableSubtotal += item.price * item.quantity;
        }
      });
    } else {
      discountableSubtotal = subtotal;
    }

    if (coupon.discountType === 'flat') {
      discount = Math.min(coupon.flatDiscountAmount || 0, discountableSubtotal);
    } else {
      discount = Math.round((discountableSubtotal * (coupon.discountPercentage || 0)) / 100);
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);
  // GST 5% is Included in product MRP
  const tax = Math.round(discountedSubtotal - (discountedSubtotal / 1.05));
  const shippingFee = subtotal > 999 || items.length === 0 ? 0 : 40;
  const totalAmount = discountedSubtotal + shippingFee;

  return { subtotal, discount, tax, shippingFee, totalAmount, validatedItems: items };
};

// @desc    Create a new order & initiate ICICI payment
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { items, deliveryAddress, couponCode, paymentMode = 'ICICI' } = req.body;

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

    const session = await mongoose.startSession();
    let savedOrder;
    try {
      session.startTransaction();

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

      savedOrder = await order.save({ session });

      // 2. Reduce Stock in Inventory & Product Collections (with FEFO sequential batches)
      for (const item of validatedItems) {
        if (item.itemType === 'Combo') {
           const combo = await Combo.findById(item.combo).lean();
           if (combo && combo.components) {
             for (const comp of combo.components) {
               const deductQty = comp.quantity * item.quantity;
               await Product.findByIdAndUpdate(
                 comp.product,
                 { $inc: { stock: -deductQty, totalSold: deductQty } },
                 { runValidators: true, session }
               );

               let remainingToDeduct = deductQty;
               const batches = await Inventory.find({
                 product: comp.product,
                 stockQuantity: { $gt: 0 },
                 expiryDate: { $gt: new Date() }
               }).sort({ expiryDate: 1 }).session(session);

               for (const batch of batches) {
                 if (remainingToDeduct <= 0) break;
                 const dQty = Math.min(batch.stockQuantity, remainingToDeduct);
                 batch.stockQuantity -= dQty;
                 remainingToDeduct -= dQty;
                 batch.adjustments.push({
                   quantityChanged: -dQty,
                   type: 'Sale',
                   reason: `Combo Order Placement (Local ID: ${savedOrder._id})`,
                   adjustedBy: req.user._id
                 });
                 await batch.save({ session });
               }
             }
           }
        } else {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity, totalSold: item.quantity } },
            { runValidators: true, session }
          );

          let remainingToDeduct = item.quantity;
          const batches = await Inventory.find({
            product: item.product,
            stockQuantity: { $gt: 0 },
            expiryDate: { $gt: new Date() }
          }).sort({ expiryDate: 1 }).session(session);

          if (batches.length === 0) {
            // Fallback if no active batches are found, just to avoid breaking
            const firstBatch = await Inventory.findOne({ product: item.product }).session(session);
            if (firstBatch) {
              firstBatch.stockQuantity = Math.max(0, firstBatch.stockQuantity - remainingToDeduct);
              firstBatch.adjustments.push({
                quantityChanged: -remainingToDeduct,
                type: 'Sale',
                reason: `Order Placement - Fallback (Local ID: ${savedOrder._id})`,
                adjustedBy: req.user._id
              });
              await firstBatch.save({ session });
            }
          } else {
            for (const batch of batches) {
              if (remainingToDeduct <= 0) break;
              const deductQty = Math.min(batch.stockQuantity, remainingToDeduct);
              batch.stockQuantity -= deductQty;
              remainingToDeduct -= deductQty;

              batch.adjustments.push({
                quantityChanged: -deductQty,
                type: 'Sale',
                reason: `Order Placement (Local ID: ${savedOrder._id})`,
                adjustedBy: req.user._id
              });
              await batch.save({ session });
            }

            if (remainingToDeduct > 0 && batches.length > 0) {
              const lastBatch = batches[batches.length - 1];
              lastBatch.stockQuantity = Math.max(0, lastBatch.stockQuantity - remainingToDeduct);
              lastBatch.adjustments.push({
                quantityChanged: -remainingToDeduct,
                type: 'Sale',
                reason: `Order Placement - Sync adjustment (Local ID: ${savedOrder._id})`,
                adjustedBy: req.user._id
              });
              await lastBatch.save({ session });
            }
          }
        }
      }

      // Increment Coupon usages if code was valid
      if (couponCode && discount > 0) {
        await Coupon.findOneAndUpdate(
          { code: couponCode.toUpperCase() },
          { $inc: { usageCount: 1 } },
          { session }
        );
      }

      // If COD, we can create the COD Payment ledger and commit
      if (paymentMode === 'COD') {
        await Payment.create([{
          order: savedOrder._id,
          gatewayTxnId: `COD-${savedOrder._id}`,
          amount: totalAmount,
          status: 'Created',
          paymentMode: 'COD'
        }], { session });

        await session.commitTransaction();
        session.endSession();

        await logActivity(req.user._id, 'CREATE_ORDER', `Created COD order ID: ${savedOrder._id}`, req);

        return res.status(201).json({
          success: true,
          order: savedOrder,
          message: 'Order placed successfully'
        });
      }

      // 3. Create Payment ledger record for ICICI (pending)
      await Payment.create([{
        order: savedOrder._id,
        gatewayTxnId: 'pending',
        amount: totalAmount,
        status: 'Created',
        paymentMode: paymentMode
      }], { session });

      await session.commitTransaction();
    } catch (dbError) {
      await session.abortTransaction();
      throw dbError;
    } finally {
      session.endSession();
    }

    // 4. Prepare ICICI Payload (Outside Database Transaction)
    const actionUrl = process.env.ICICI_INITIATE_SALE_URL;
    if (!actionUrl) throw new Error('ICICI_INITIATE_SALE_URL missing');
    
    const iciciPayload = {
      addlParam1: "000",
      addlParam2: "111",
      aggregatorID: process.env.ICICI_AGGREGATOR_ID || '123456',
      amount: Number(totalAmount).toFixed(2),
      currencyCode: "356", // INR
      customerEmailID: req.user.email || "test@gmail.com",
      customerMobileNo: String(req.user.phone || "9999999999").replace(/\\D/g, '').substring(0, 10),
      customerName: String(req.user.name || "Customer").replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20),
      merchantId: process.env.ICICI_MERCHANT_ID,
      merchantTxnNo: savedOrder._id.toString(),
      payType: '0', // 0 = Redirect to gateway
      returnURL: `${process.env.FRONTEND_URL || 'http://localhost:7052'}/api/orders/icici-callback`,
      transactionType: "SALE",
      txnDate: new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14) // YYYYMMDDHHMMSS
    };

    iciciPayload.secureHash = generateICICISecureHash(iciciPayload);

    // Save initial transaction state
    await Payment.findOneAndUpdate({ order: savedOrder._id }, { $set: { gatewayTxnId: 'initiated' } });

    await logActivity(req.user._id, 'CREATE_ORDER', `Created order ID: ${savedOrder._id}, initiating ICICI S2S payment`, req);

    try {
      const iciciResponse = await axios.post(actionUrl, iciciPayload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log("ICICI S2S Response:", iciciResponse.data);

      if (iciciResponse.data && (iciciResponse.data.responseCode === '0000' || iciciResponse.data.responseCode === 'R1000')) {
        let paymentUrl = iciciResponse.data.paymentUrl || iciciResponse.data.redirectURI;
        if (paymentUrl && iciciResponse.data.tranCtx && !paymentUrl.includes('tranCtx')) {
          paymentUrl += (paymentUrl.includes('?') ? '&' : '?') + 'tranCtx=' + iciciResponse.data.tranCtx;
        }
        
        if (paymentUrl) {
          return res.status(201).json({
            success: true,
            order: savedOrder,
            iciciActionUrl: paymentUrl
          });
        }
      }
      
      // Fallback/Error
      return res.status(201).json({
        success: true,
        order: savedOrder,
        iciciActionUrl: null,
        gatewayError: iciciResponse.data.responseDescription || 'Payment Gateway Error'
      });

    } catch (apiError) {
      console.error("ICICI S2S API Error:", apiError.response?.data || apiError.message);
      return res.status(201).json({
        success: true,
        order: savedOrder,
        iciciActionUrl: null,
        gatewayError: apiError.response?.data?.responseDescription || 'Failed to connect to ICICI Gateway'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Handle ICICI Callback (Server-to-Server form post from ICICI gateway)
// @route   POST /api/orders/icici-callback
// @access  Public
export const iciciCallback = async (req, res, next) => {
  let session;
  try {
    const responseParams = req.body;
    
    let frontendUrl = process.env.CLIENT_URL || 'http://localhost:7051';
    
    if (!responseParams || Object.keys(responseParams).length === 0) {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Invalid response from Payment Gateway')}`);
    }

    const isValidHash = verifyICICISecureHash(responseParams);
    if (!isValidHash) {
      console.error('ICICI Hash Verification Failed:', responseParams);
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Payment verification failed (Hash Mismatch)')}`);
    }

    const amount = responseParams.amount || responseParams.Amount;
    const responseCode = responseParams.responseCode || responseParams.ResponseCode;
    const txnId = responseParams.txnID || responseParams.txnId || responseParams.TxnId;
    const bankRefNo = responseParams.bankRefNo || responseParams.BankRefNo;
    const message = responseParams.respDescription || responseParams.message || responseParams.Message;
    const merchantTranId = responseParams.merchantTxnNo || responseParams.MerchantTxnNo || responseParams.merchantTranId || responseParams.orderId;

    if (!merchantTranId) {
      console.error('Missing Transaction ID in callback:', responseParams);
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Missing transaction ID from payment gateway')}`);
    }

    const order = await Order.findById(merchantTranId);
    if (!order) {
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Order not found.')}`);
    }

    const payment = await Payment.findOne({ order: order._id });

    session = await mongoose.startSession();
    session.startTransaction();

    const lockedPayment = await Payment.findById(payment._id).session(session);
    const lockedOrder = await Order.findById(order._id).session(session);

    if (lockedOrder.paymentStatus === 'Paid') {
      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/user/orders/${lockedOrder._id}?success=true`);
    }
    
    if (lockedOrder.paymentStatus === 'Failed' && responseCode !== '0000' && responseCode !== '0') {
      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent(message || 'Payment Failed')}`);
    }

    if (responseCode === '0000' || responseCode === '0') {
      if (Number(amount) !== Number(lockedOrder.totalAmount)) {
        lockedOrder.paymentStatus = 'Failed';
        lockedOrder.gatewayTxnId = txnId;
        lockedOrder.bankRefNo = bankRefNo;
        lockedOrder.paymentMode = 'ICICI';
        await lockedOrder.save({ session });

        lockedPayment.status = 'Failed';
        lockedPayment.gatewayTxnId = txnId;
        lockedPayment.bankRefNo = bankRefNo;
        lockedPayment.paymentMode = 'ICICI';
        lockedPayment.failureMessage = `Amount mismatch (Paid: ${amount}, Expected: ${lockedOrder.totalAmount})`;
        lockedPayment.encResponse = JSON.stringify(responseParams);
        await lockedPayment.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent('Payment failed due to amount mismatch. Please contact support.')}`);
      }

      lockedOrder.paymentStatus = 'Paid';
      lockedOrder.orderStatus = 'Confirmed';
      lockedOrder.confirmedAt = Date.now();
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Captured';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/user/orders/${lockedOrder._id}?success=true`);
      
    } else {
      lockedOrder.paymentStatus = 'Failed';
      lockedOrder.gatewayTxnId = txnId;
      lockedOrder.bankRefNo = bankRefNo;
      lockedOrder.paymentMode = 'ICICI';
      await lockedOrder.save({ session });

      lockedPayment.status = 'Failed';
      lockedPayment.gatewayTxnId = txnId;
      lockedPayment.bankRefNo = bankRefNo;
      lockedPayment.paymentMode = 'ICICI';
      lockedPayment.failureMessage = message || 'Payment Failed';
      lockedPayment.encResponse = JSON.stringify(responseParams);
      await lockedPayment.save({ session });

      for (const item of lockedOrder.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } }, { session });
        const batch = await Inventory.findOne({ product: item.product }).sort({ expiryDate: -1 }).session(session);
        if (batch) {
          batch.stockQuantity += item.quantity;
          batch.adjustments.push({
            quantityChanged: item.quantity,
            type: 'AuditAdjustment',
            reason: `Payment Verification Failure Stock Restoral (Order ID: ${lockedOrder._id})`,
            adjustedBy: lockedOrder.user
          });
          await batch.save({ session });
        }
      }

      await session.commitTransaction();
      session.endSession();
      return res.redirect(`${frontendUrl}/checkout?error=${encodeURIComponent(message || 'Payment Failed')}`);
    }

  } catch (error) {
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    console.error('ICICI Callback Error:', error);
    let fUrl = process.env.CLIENT_URL || 'http://localhost:7051';
    return res.redirect(`${fUrl}/checkout?error=${encodeURIComponent('Payment processing failed due to an internal server error.')}`);
  }
};

// @desc    Handle ICICI Payment Advice (Server-to-Server webhook)
// @route   POST /api/orders/icici-advice
// @access  Public
export const iciciAdvice = async (req, res, next) => {
  let session;
  try {
    const responseParams = req.body;

    if (!responseParams || Object.keys(responseParams).length === 0) {
      return res.status(400).send('Invalid Response');
    }

    const isValidHash = verifyICICISecureHash(responseParams);
    if (!isValidHash) {
      console.error('ICICI Advice Hash Verification Failed:', responseParams);
      return res.status(400).send('Invalid Hash');
    }
    
    // (Additional webhook processing can be implemented here if required)
    return res.status(200).send('OK');
  } catch (error) {
    console.error('ICICI Advice Error:', error);
    return res.status(500).send('Internal Server Error');
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

// @desc    Clear all orders
// @route   DELETE /api/orders/clear-all
// @access  Private/Super Admin
export const deleteAllOrders = async (req, res, next) => {
  try {
    await Order.deleteMany({});
    await Payment.deleteMany({});
    
    await logActivity(req.user._id, 'CLEAR_ALL_ORDERS', 'Cleared all orders and payments from the system', req);

    res.json({ success: true, message: 'All orders have been successfully cleared.' });
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

    // Business Logic: Do not show incomplete online orders to admin
    const query = {
      $or: [
        { paymentMode: 'COD' },
        { paymentStatus: { $nin: ['Pending', 'Failed'] } }
      ]
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
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

    // If Order is Cancelled and wasn't already Cancelled, restore items to stock
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
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

    // Process ICICI Refund
    const refundResult = await processICICIRefund(
      'REFUND_' + Date.now(),
      order.totalAmount,
      payment.gatewayTxnId
    );

    payment.status = 'Refunded';
    payment.refundDetails = {
      refundId: refundResult.refundId || 'MANUAL_REFUND_' + Date.now(),
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

    res.json({ success: true, message: 'Refund recorded and processed successfully via ICICI Gateway.', order });
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
