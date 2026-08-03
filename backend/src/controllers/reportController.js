import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// @desc    Get Admin Dashboard summary stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin/Manager
let cachedDashboardData = null;
let dashboardCacheTime = 0;
const DASHBOARD_CACHE_TTL = 15 * 1000; // 15 seconds cache TTL

// @desc    Get Admin Dashboard summary stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin/Manager
export const getDashboardSummary = async (req, res, next) => {
  try {
    if (cachedDashboardData && (Date.now() - dashboardCacheTime < DASHBOARD_CACHE_TTL)) {
      return res.json(cachedDashboardData);
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const dayOfWeek = now.getDay();
    const distanceToMon = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMon);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Parallelize all DB queries with Promise.all
    const [
      salesAggregation,
      totalCustomers,
      lowStockItems,
      totalProducts,
      orderStatusesRaw,
      walletAggregation,
      pendingAmountAgg,
      yearlySales,
      monthlySales,
      weeklySales,
      topProductsAggregation,
      lowStockDetails
    ] = await Promise.all([
      // 1. Sales & Revenue
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      // 2. Customers
      User.countDocuments({ role: 'Customer' }),
      // 3. Low stock count
      Inventory.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
      }),
      // 4. Products count
      Product.countDocuments(),
      // 5. Order Statuses
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      // 6. Wallet Aggregation
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalDeliveryCharge: { $sum: '$shippingFee' }, totalTaxCollected: { $sum: '$tax' } } }
      ]),
      // 7. Pending Amount
      Order.aggregate([
        { $match: { paymentStatus: 'Pending', orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, pendingAmount: { $sum: '$totalAmount' } } }
      ]),
      // 8. Yearly Sales
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' }, createdAt: { $gte: startOfYear, $lte: endOfYear } } },
        { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      // 9. Monthly Sales
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' }, createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: { $dayOfMonth: '$createdAt' }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      // 10. Weekly Sales
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' }, createdAt: { $gte: startOfWeek, $lte: endOfWeek } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } }
      ]),
      // 11. Top Products
      Order.aggregate([
        { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            unitsSold: { $sum: '$items.quantity' },
            revenueGenerated: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 }
      ]),
      // 12. Low Stock Details
      Inventory.find({
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
      }).populate('product', 'name category price').limit(5).lean()
    ]);

    const totalSales = salesAggregation[0]?.totalSales || 0;
    const totalOrders = salesAggregation[0]?.count || 0;

    const orderStatuses = orderStatusesRaw.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { Placed: 0, Confirmed: 0, Packed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });

    const adminWallet = {
      inHouseEarning: totalSales,
      commissionEarned: 0,
      deliveryChargeEarned: walletAggregation[0]?.totalDeliveryCharge || 0,
      totalTaxCollected: walletAggregation[0]?.totalTaxCollected || 0,
      pendingAmount: pendingAmountAgg[0]?.pendingAmount || 0
    };

    // Format Sales Overview
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyFormatted = monthsList.map((mName, idx) => {
      const found = yearlySales.find(item => item._id === idx + 1);
      const rev = found ? found.revenue : 0;
      return { name: mName, inHouse: rev, seller: 0, commission: 0, revenue: rev, orders: found ? found.orders : 0 };
    });

    const weeksList = [
      { name: 'Week 1', min: 1, max: 7 },
      { name: 'Week 2', min: 8, max: 14 },
      { name: 'Week 3', min: 15, max: 21 },
      { name: 'Week 4', min: 22, max: 28 },
      { name: 'Week 5', min: 29, max: 31 },
    ];
    const monthlyFormatted = weeksList.map(w => {
      const matching = monthlySales.filter(item => item._id >= w.min && item._id <= w.max);
      const sumRevenue = matching.reduce((acc, item) => acc + item.revenue, 0);
      const sumOrders = matching.reduce((acc, item) => acc + item.orders, 0);
      return { name: w.name, inHouse: sumRevenue, seller: 0, commission: 0, revenue: sumRevenue, orders: sumOrders };
    });

    const daysMap = [
      { name: 'Mon', mongoDay: 2 },
      { name: 'Tue', mongoDay: 3 },
      { name: 'Wed', mongoDay: 4 },
      { name: 'Thu', mongoDay: 5 },
      { name: 'Fri', mongoDay: 6 },
      { name: 'Sat', mongoDay: 7 },
      { name: 'Sun', mongoDay: 1 },
    ];
    const weeklyFormatted = daysMap.map(d => {
      const found = weeklySales.find(item => item._id === d.mongoDay);
      const rev = found ? found.revenue : 0;
      return { name: d.name, inHouse: rev, seller: 0, commission: 0, revenue: rev, orders: found ? found.orders : 0 };
    });

    const formattedSalesOverview = {
      yearly: yearlyFormatted,
      monthly: monthlyFormatted,
      weekly: weeklyFormatted
    };

    // Batch populate product thumbnails for Top Products
    const topProdIds = topProductsAggregation.map(p => p._id).filter(Boolean);
    let topProducts = [];
    if (topProdIds.length > 0) {
      const pDetails = await Product.find({ _id: { $in: topProdIds } }).select('images').lean();
      const pMap = new Map(pDetails.map(p => [p._id.toString(), p.images?.[0] || '']));
      topProducts = topProductsAggregation.map(prod => ({
        ...prod,
        image: pMap.get(prod._id?.toString()) || ''
      }));
    }

    const responsePayload = {
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        lowStockItems,
        totalProducts,
        totalStores: 1,
        orderStatuses,
        adminWallet
      },
      salesOverview: formattedSalesOverview,
      topProducts,
      lowStockDetails
    };

    cachedDashboardData = responsePayload;
    dashboardCacheTime = Date.now();

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};

// @desc    Export Sales Report as PDF
// @route   GET /api/reports/export/pdf
// @access  Private/Admin/Manager
export const exportSalesReportPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { paymentStatus: 'Paid' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).populate('user', 'name email').limit(2000);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.pdf`);
    
    doc.pipe(res);

    // Title Section
    doc.fillColor('#1E3F20').fontSize(24).text('MAXGLOW ECOMMERCE PLATFORM', { align: 'center' });
    doc.fillColor('#2C3E2D').fontSize(14).text('Executive Sales Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary KPIs
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    doc.fontSize(12).fillColor('#1E3F20').text('SUMMARY METRICS', { underline: true });
    doc.fillColor('#2C3E2D').text(`Total Audited Orders: ${orders.length}`);
    doc.text(`Total Gross Revenue: INR ${totalRevenue.toLocaleString()}`);
    doc.moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    doc.fillColor('#1E3F20').fontSize(10);
    doc.text('Order ID', 50, tableTop);
    doc.text('Customer', 180, tableTop);
    doc.text('Date', 320, tableTop);
    doc.text('Payment', 400, tableTop);
    doc.text('Amount (INR)', 480, tableTop, { align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#1E3F20').stroke();
    
    let y = tableTop + 25;
    doc.fillColor('#2C3E2D');
    
    orders.forEach(order => {
      // Avoid printing beyond page bottom
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      doc.text(order._id.toString().substring(0, 10) + '...', 50, y);
      doc.text(order.user?.name || 'Guest', 180, y);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 320, y);
      doc.text(order.paymentStatus, 400, y);
      doc.text(order.totalAmount.toLocaleString(), 480, y, { align: 'right' });
      y += 20;
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export Sales Report as Excel
// @route   GET /api/reports/export/excel
// @access  Private/Admin/Manager
export const exportSalesReportExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { paymentStatus: 'Paid' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query).populate('user', 'name email').limit(2000);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Styling
    worksheet.columns = [
      { header: 'Order ID', key: 'id', width: 25 },
      { header: 'Customer Name', key: 'customer', width: 25 },
      { header: 'Customer Email', key: 'email', width: 25 },
      { header: 'Order Date', key: 'date', width: 20 },
      { header: 'Payment Status', key: 'payment', width: 15 },
      { header: 'Order Status', key: 'order', width: 15 },
      { header: 'Subtotal (INR)', key: 'subtotal', width: 15 },
      { header: 'Discount (INR)', key: 'discount', width: 15 },
      { header: 'Tax (INR)', key: 'tax', width: 15 },
      { header: 'Total Paid (INR)', key: 'total', width: 18 }
    ];

    // Format Header Row
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E3F20' } // Brand Green
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate data
    orders.forEach(order => {
      worksheet.addRow({
        id: order._id.toString(),
        customer: order.user?.name || 'Guest',
        email: order.user?.email || 'N/A',
        date: new Date(order.createdAt).toLocaleDateString(),
        payment: order.paymentStatus,
        order: order.orderStatus,
        subtotal: order.subtotal,
        discount: order.couponDiscount,
        tax: order.tax,
        total: order.totalAmount
      });
    });

    // Totals Row
    const totalRowIndex = orders.length + 2;
    worksheet.getRow(totalRowIndex).getCell('customer').value = 'GRAND TOTAL';
    worksheet.getRow(totalRowIndex).getCell('customer').font = { bold: true };
    worksheet.getRow(totalRowIndex).getCell('total').value = {
      formula: `SUM(J2:J${totalRowIndex - 1})`
    };
    worksheet.getRow(totalRowIndex).getCell('total').font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
