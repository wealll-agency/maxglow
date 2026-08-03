import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Create a coupon code
// @route   POST /api/coupons
// @access  Private/Admin/Manager
export const createCoupon = async (req, res, next) => {
  const { code, discountPercentage, expiryDate, usageLimit, applicableProducts, isCombo } = req.body;

  try {
    const codeUpper = code.toUpperCase().trim();
    const couponExists = await Coupon.findOne({ code: codeUpper });

    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: codeUpper,
      discountPercentage,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit || 100,
      isCombo: isCombo || false,
      applicableProducts: applicableProducts || []
    });

    await logActivity(req.user._id, 'CREATE_COUPON', `Created coupon code: ${codeUpper}`, req);

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate/Apply a coupon
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res, next) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'Coupon is expired, inactive, or has reached its usage limit' });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountPercentage: coupon.discountPercentage,
      code: coupon.code,
      isCombo: coupon.isCombo,
      applicableProducts: coupon.applicableProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupon codes
// @route   GET /api/coupons
// @access  Private/Admin/Manager/Staff
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).populate('applicableProducts', 'name');
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon code
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      await logActivity(req.user._id, 'DELETE_COUPON', `Deleted coupon ID: ${req.params.id}`, req);
      res.json({ success: true, message: 'Coupon removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Coupon not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get advanced usage analytics for a coupon code
// @route   GET /api/coupons/:id/analytics
// @access  Private/Admin/Manager/Staff
export const getCouponAnalytics = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon code not found' });
    }

    const couponCode = coupon.code.toUpperCase().trim();
    const { from, to, preset, groupBy = 'day', includeCancelled = 'false', page = 1, limit = 20 } = req.query;

    // Date calculations based on preset or custom range
    let startDate = null;
    let endDate = new Date();

    const now = new Date();
    if (preset === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (preset === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (preset === '7days') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (preset === '30days') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (preset === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'lastMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (preset === 'thisYear') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (from || to) {
      if (from) startDate = new Date(from);
      if (to) endDate = new Date(to);
    }

    // Build Match criteria (case-insensitive regex)
    const escapedCode = couponCode.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const matchCriteria = {
      couponCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') }
    };

    if (includeCancelled !== 'true') {
      matchCriteria.orderStatus = { $ne: 'Cancelled' };
    }

    if (startDate || (to && endDate)) {
      matchCriteria.createdAt = {};
      if (startDate) matchCriteria.createdAt.$gte = startDate;
      if (endDate) matchCriteria.createdAt.$lte = endDate;
    }

    // Determine GroupBy Date Format
    let dateFormat = "%Y-%m-%d";
    if (groupBy === 'month') {
      dateFormat = "%Y-%m";
    } else if (groupBy === 'week') {
      dateFormat = "%Y-%U";
    }

    // Execute parallelized MongoDB aggregations
    const [
      summaryResult,
      timelineResult,
      stateResult,
      cityResult,
      pincodeResult,
      localityResult,
      customerResult,
      recentOrders,
      statusDistributionResult
    ] = await Promise.all([
      // 1. Total KPI Summary
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: null,
            totalUses: { $sum: 1 },
            totalDiscountGiven: { $sum: "$couponDiscount" },
            totalRevenueGenerated: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" }
          }
        }
      ]),

      // 2. Usage Timeline
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
            uses: { $sum: 1 },
            discountAmount: { $sum: "$couponDiscount" },
            revenueGenerated: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 3. State-wise Usage
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $ifNull: ["$deliveryAddress.state", "Unknown"] },
            uses: { $sum: 1 },
            discount: { $sum: "$couponDiscount" },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { uses: -1 } },
        { $limit: 15 }
      ]),

      // 4. City-wise Usage
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $ifNull: ["$deliveryAddress.city", "Unknown"] },
            uses: { $sum: 1 },
            discount: { $sum: "$couponDiscount" },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { uses: -1 } },
        { $limit: 20 }
      ]),

      // 5. Pincode-wise Usage
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $ifNull: ["$deliveryAddress.pincode", "Unknown"] },
            uses: { $sum: 1 },
            discount: { $sum: "$couponDiscount" },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { uses: -1 } },
        { $limit: 25 }
      ]),

      // 6. Area / Locality-wise Usage
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: { $ifNull: ["$deliveryAddress.locality", "$deliveryAddress.address", "Unknown"] },
            uses: { $sum: 1 },
            discount: { $sum: "$couponDiscount" },
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { uses: -1 } },
        { $limit: 25 }
      ]),

      // 6. Customer Usage & Top Customers
      Order.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: "$user",
            timesUsed: { $sum: 1 },
            totalDiscountReceived: { $sum: "$couponDiscount" },
            totalAmountSpent: { $sum: "$totalAmount" },
            lastUsed: { $max: "$createdAt" },
            customerName: { $first: "$deliveryAddress.name" },
            customerPhone: { $first: "$deliveryAddress.phone" }
          }
        },
        { $sort: { timesUsed: -1, totalAmountSpent: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        {
          $project: {
            customerName: 1,
            customerPhone: 1,
            timesUsed: 1,
            totalDiscountReceived: 1,
            totalAmountSpent: 1,
            lastUsed: 1,
            email: { $arrayElemAt: ["$userInfo.email", 0] },
            registeredName: { $arrayElemAt: ["$userInfo.name", 0] }
          }
        }
      ]),

      // 7. Recent Paginated Usage Activity
      Order.find(matchCriteria)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('user', 'name email phone')
        .select('_id deliveryAddress couponDiscount totalAmount orderStatus paymentStatus createdAt'),

      // 8. Order Status Distribution
      Order.aggregate([
        { $match: { couponCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') } } },
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const summary = summaryResult[0] || {
      totalUses: 0,
      totalDiscountGiven: 0,
      totalRevenueGenerated: 0,
      avgOrderValue: 0
    };

    const statusDistribution = statusDistributionResult.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const totalOrderCount = await Order.countDocuments(matchCriteria);

    res.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        isActive: coupon.isActive,
        expiryDate: coupon.expiryDate
      },
      filters: {
        preset: preset || 'all',
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        includeCancelled: includeCancelled === 'true'
      },
      summary: {
        totalUses: summary.totalUses,
        totalDiscountGiven: Math.round(summary.totalDiscountGiven),
        totalRevenueGenerated: Math.round(summary.totalRevenueGenerated),
        avgOrderValue: Math.round(summary.avgOrderValue || 0)
      },
      timeline: timelineResult.map(t => ({
        date: t._id,
        uses: t.uses,
        discountAmount: Math.round(t.discountAmount),
        revenueGenerated: Math.round(t.revenueGenerated)
      })),
      geographics: {
        states: stateResult.map(s => ({ state: s._id, uses: s.uses, discount: Math.round(s.discount), revenue: Math.round(s.revenue) })),
        cities: cityResult.map(c => ({ city: c._id, uses: c.uses, discount: Math.round(c.discount), revenue: Math.round(c.revenue) })),
        pincodes: pincodeResult.map(p => ({ pincode: p._id, uses: p.uses, discount: Math.round(p.discount), revenue: Math.round(p.revenue) })),
        areas: localityResult.map(a => ({ area: a._id, uses: a.uses, discount: Math.round(a.discount), revenue: Math.round(a.revenue) }))
      },
      topCustomers: customerResult.map(c => ({
        userId: c._id,
        name: c.customerName || c.registeredName || 'Customer',
        email: c.email || 'N/A',
        phone: c.customerPhone || 'N/A',
        timesUsed: c.timesUsed,
        lastUsed: c.lastUsed,
        totalDiscountReceived: Math.round(c.totalDiscountReceived),
        totalAmountSpent: Math.round(c.totalAmountSpent)
      })),
      statusDistribution,
      recentActivity: recentOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalOrderCount,
        pages: Math.ceil(totalOrderCount / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};
