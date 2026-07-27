import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// @desc    Get Admin Dashboard summary stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin/Manager
export const getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Calculate Total Sales & Revenue (Total amount of Paid/Delivered orders)
    const salesAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);
    const totalSales = salesAggregation[0]?.totalSales || 0;
    const totalOrders = salesAggregation[0]?.count || 0;

    // 2. Count Customers
    const totalCustomers = await User.countDocuments({ role: 'Customer' });

    // 3. Count Low Stock Items
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    });

    // New: Count Total Products
    const totalProducts = await Product.countDocuments();

    // New: Calculate Order Statuses (Pending, Confirmed, Packed, Shipped, Delivered, Cancelled)
    const orderStatusesRaw = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    const orderStatuses = orderStatusesRaw.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { Placed: 0, Confirmed: 0, Packed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 });

    // New: Admin Wallet Stats
    const walletAggregation = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalDeliveryCharge: { $sum: '$shippingFee' },
          totalTaxCollected: { $sum: '$tax' }
        }
      }
    ]);
    const pendingAmountAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Pending', orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, pendingAmount: { $sum: '$totalAmount' } } }
    ]);
    
    const adminWallet = {
      inHouseEarning: totalSales, // Same as gross sales since no vendors
      commissionEarned: 0, // No multi-vendor
      deliveryChargeEarned: walletAggregation[0]?.totalDeliveryCharge || 0,
      totalTaxCollected: walletAggregation[0]?.totalTaxCollected || 0,
      pendingAmount: pendingAmountAgg[0]?.pendingAmount || 0
    };

    // 4. Get monthly sales data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    let formattedSalesOverview = [];
    try {
      const monthlySales = await Order.aggregate([
        {
          $match: {
            paymentStatus: 'Paid',
            orderStatus: { $ne: 'Cancelled' },
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Format monthly data for chart display
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formattedSalesOverview = monthlySales.map(item => ({
        name: `${months[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
        orders: item.orders
      }));
    } catch (err) {
      console.error('Dashboard Monthly Sales Error:', err);
    }

    // 5. Get top selling products
    let topProducts = [];
    try {
      const topProductsAggregation = await Order.aggregate([
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
      ]);

      // Populate thumbnails
      for (const prod of topProductsAggregation) {
        const pDetail = await Product.findById(prod._id).select('images');
        topProducts.push({
          ...prod,
          image: pDetail?.images[0] || ''
        });
      }
    } catch (err) {
      console.error('Dashboard Top Products Error:', err);
    }

    // 6. Get low stock alert items detail list
    const lowStockDetails = await Inventory.find({
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
    }).populate('product', 'name category price').limit(5);

    res.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        lowStockItems,
        totalProducts,
        totalStores: 1, // Single vendor store
        orderStatuses,
        adminWallet
      },
      salesOverview: formattedSalesOverview,
      topProducts,
      lowStockDetails
    });
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
