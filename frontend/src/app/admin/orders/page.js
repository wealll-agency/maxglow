"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';


import Image from 'next/image';


import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus, refundOrder, createDelhiveryShipment, cancelDelhiveryShipment, getDelhiveryLabel, fetchWarehouses, clearAllOrders } from '../../../store/adminSlice';
import { ShoppingBag, Eye, MapPin, Check, Filter, Clock, Search, X, Printer, Package, Truck, CheckCircle, CreditCard, RotateCcw, AlertTriangle, Download } from 'lucide-react';


import { useNotification } from '../../../context/NotificationContext';

const getStateCode = (stateName) => {
  const states = {
    'jammu': '01', 'himachal': '02', 'punjab': '03', 'chandigarh': '04',
    'uttarakhand': '05', 'haryana': '06', 'delhi': '07', 'rajasthan': '08',
    'uttar pradesh': '09', 'up': '09', 'bihar': '10', 'sikkim': '11',
    'arunachal': '12', 'nagaland': '13', 'manipur': '14', 'mizoram': '15',
    'tripura': '16', 'meghalaya': '17', 'assam': '18', 'west bengal': '19',
    'wb': '19', 'jharkhand': '20', 'odisha': '21', 'orissa': '21',
    'chhattisgarh': '22', 'madhya pradesh': '23', 'mp': '23', 'gujarat': '24',
    'maharashtra': '27', 'karnataka': '29', 'goa': '30', 'kerala': '32',
    'tamil nadu': '33', 'telangana': '36', 'andhra pradesh': '37', 'ap': '37'
  };
  const key = (stateName || '').toLowerCase().trim();
  for (const s in states) {
    if (key.includes(s)) return states[s];
  }
  return '19'; // Default to West Bengal GST state code
};

const numberToWords = (num) => {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (num === 0) return 'Zero';
  const makeGroup = (n) => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };
  let cleanNum = Math.floor(num);
  let words = '';
  if (cleanNum >= 10000000) {
    words += makeGroup(Math.floor(cleanNum / 10000000)) + ' Crore ';
    cleanNum %= 10000000;
  }
  if (cleanNum >= 100000) {
    words += makeGroup(Math.floor(cleanNum / 100000)) + ' Lakh ';
    cleanNum %= 100000;
  }
  if (cleanNum >= 1000) {
    words += makeGroup(Math.floor(cleanNum / 1000)) + ' Thousand ';
    cleanNum %= 1000;
  }
  if (cleanNum > 0) {
    words += makeGroup(cleanNum);
  }
  let paise = Math.round((num - Math.floor(num)) * 100);
  let paiseWords = '';
  if (paise > 0) {
    if (paise >= 20) {
      paiseWords = b[Math.floor(paise / 10)] + ' ' + a[paise % 10];
    } else {
      paiseWords = a[paise];
    }
    paiseWords = ' and ' + paiseWords.trim() + ' Paise';
  }
  return 'INR ' + words.trim() + paiseWords + ' Only';
};

function AdminOrdersContent() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterStatus = searchParams.get('status');
  const { orders, ordersLoading, warehouses } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const { showAlert, showConfirm } = useNotification();

  // Selected order modal details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  let totalQty = 0;
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let shippingFee = 0;
  let shippingTaxable = 0;
  let shippingCGST = 0;
  let shippingSGST = 0;
  let couponDiscount = 0;
  let grandTotal = 0;
  let roundOff = 0;

  if (selectedOrder) {
    selectedOrder.items.forEach(item => {
      const basePrice = Math.round((item.price / 1.05) * 100) / 100;
      const taxAmt = Math.round((item.price - basePrice) * 100) / 100;
      totalQty += item.quantity;
      totalTaxable += basePrice * item.quantity;
      totalCGST += (taxAmt / 2) * item.quantity;
      totalSGST += (taxAmt / 2) * item.quantity;
    });

    shippingFee = selectedOrder.shippingFee || 0;
    if (shippingFee > 0) {
      shippingTaxable = Math.round((shippingFee / 1.05) * 100) / 100;
      const shippingTax = Math.round((shippingFee - shippingTaxable) * 100) / 100;
      shippingCGST = shippingTax / 2;
      shippingSGST = shippingTax / 2;
    }

    couponDiscount = selectedOrder.couponDiscount || 0;
    grandTotal = selectedOrder.totalAmount || 0;
    roundOff = grandTotal - (totalTaxable + totalCGST + totalSGST + shippingTaxable + shippingCGST + shippingSGST - couponDiscount);
  }

  useEffect(() => {
    dispatch(fetchAdminOrders({ limit: 1000 }));
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const handleClearOrders = async () => {
    const confirmed = await showConfirm('Are you absolutely sure you want to delete ALL orders? This action cannot be undone and will permanently wipe all order and payment history.');
    if (confirmed) {
      dispatch(clearAllOrders())
        .unwrap()
        .then(() => {
          showAlert('All orders have been cleared successfully.', 'success');
        })
        .catch(err => {
          showAlert(err || 'Failed to clear orders.', 'error');
        });
    }
  };

  const handleStatusChange = (id, status) => {
    setActionSuccess('');
    dispatch(updateOrderStatus({ id, status, trackingNumber: status === 'Shipped' ? trackingNumber : undefined }))
      .unwrap()
      .then((updatedOrder) => {
        setActionSuccess(`Order status advanced to ${status}!`);
        setSelectedOrder(updatedOrder);
        dispatch(fetchAdminOrders({ limit: 1000 }));
      })
      .catch((err) => {
        showAlert(err || 'Failed to update order status', 'error');
      });
  };

  const handleRefund = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this order and record it as refunded? (You must initiate the actual refund in your ICICI Dashboard if auto-refund fails)');
    if (confirmed) {
      setActionSuccess('');
      dispatch(refundOrder(id))
        .unwrap()
        .then((updatedOrder) => {
          setActionSuccess('Order cancelled and refund recorded. Please check if refund processed via ICICI.');
          setSelectedOrder(updatedOrder);
          dispatch(fetchAdminOrders({ limit: 1000 }));
        })
        .catch((err) => {
          showAlert(err || 'Refund processing failed', 'error');
        });
    }
  };

  const handleCreateDelhiveryShipment = async (orderId) => {
    const confirmed = await showConfirm('Are you sure you want to create shipments for this order based on warehouses?');
    if(confirmed) {
      setActionSuccess('');
      dispatch(createDelhiveryShipment(orderId))
        .unwrap()
        .then((res) => {
          setActionSuccess('Shipments created successfully!');
          dispatch(fetchAdminOrders({ limit: 1000 }));
          // Update local selectedOrder with new shipments
          const updated = {...selectedOrder, shipments: res.shipments, orderStatus: 'Shipped'};
          setSelectedOrder(updated);
        })
        .catch(err => showAlert(err || 'Failed to create shipments', 'error'));
    }
  };

  const handleCancelDelhiveryShipment = async (waybill) => {
    const confirmed = await showConfirm('Cancel this shipment?');
    if(confirmed) {
      setActionSuccess('');
      dispatch(cancelDelhiveryShipment(waybill))
        .unwrap()
        .then(() => {
          setActionSuccess('Shipment cancelled.');
          dispatch(fetchAdminOrders({ limit: 1000 }));
          // Update the specific shipment in the local object
          const updatedShipments = selectedOrder.shipments.map(s => s.waybill === waybill ? { ...s, status: 'Cancelled' } : s);
          const updated = {...selectedOrder, shipments: updatedShipments};
          if (updatedShipments.every(s => s.status === 'Cancelled')) {
            updated.orderStatus = 'Cancelled';
          }
          setSelectedOrder(updated);
        })
        .catch(err => showAlert(err || 'Cancellation failed', 'error'));
    }
  };
  
  const handleGetLabel = (waybill) => {
    dispatch(getDelhiveryLabel(waybill))
      .unwrap()
      .then((res) => {
        const pkg = res.label?.packages?.[0];
        if (pkg && pkg.pdf_download_link) {
          window.open(pkg.pdf_download_link, '_blank');
        } else if (pkg) {
          // Generate a dynamic HTML label since PDF link is not provided
          const printWindow = window.open('', '_blank', 'width=600,height=800');
          printWindow.document.write(`
            <html>
              <head>
                <title>Shipping Label - ${pkg.wbn}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
                  .label-box { border: 2px solid #000; width: 400px; margin: 0 auto; padding: 15px; }
                  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                  .barcode-container { text-align: center; margin: 15px 0; border-bottom: 2px solid #000; padding-bottom: 15px; }
                  .barcode-container img { max-width: 100%; height: 60px; }
                  .section { border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 10px; }
                  .fw-bold { font-weight: bold; }
                  .fs-lg { font-size: 24px; }
                </style>
              </head>
              <body>
                <div class="label-box">
                  <div class="header">
                    <div>
                      <h2>DELHIVERY</h2>
                      <div class="fw-bold fs-lg">${pkg.sort_code || ''}</div>
                    </div>
                    <div style="text-align: right;">
                      <div class="fw-bold fs-lg">${pkg.pt}</div>
                      <div class="fw-bold">₹ ${pkg.rs}</div>
                    </div>
                  </div>
                  
                  <div class="barcode-container">
                    ${pkg.barcode ? `<img src="${pkg.barcode}" alt="Barcode"/>` : ''}
                    <div class="fw-bold" style="letter-spacing: 2px; margin-top: 5px;">${pkg.wbn}</div>
                  </div>

                  <div class="section">
                    <div class="fw-bold">Deliver To:</div>
                    <div>${pkg.consignee_name || ''}</div>
                    <div>${pkg.radd}</div>
                    <div>${pkg.rcty}, ${pkg.rst} - <span class="fw-bold fs-lg">${pkg.rpin}</span></div>
                    <div>Ph: ${pkg.rph || ''}</div>
                  </div>

                  <div class="section">
                    <div class="fw-bold">Shipped By:</div>
                    <div>${pkg.snm}</div>
                    <div>${pkg.sadd}</div>
                  </div>

                  <div>
                    <div class="fw-bold">Product:</div>
                    <small>${pkg.prd}</small>
                  </div>
                </div>
                <script>
                  setTimeout(() => { window.print(); }, 500);
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          showAlert('Label not available or generated yet.', 'warning');
        }
      })
      .catch(err => showAlert(err || 'Failed to get label', 'error'));
  };

  const closeDetailsModal = () => {
    setSelectedOrder(null);
    setTrackingNumber('');
    setActionSuccess('');
  };
  // Filter States
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(filterStatus || 'All');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('All');

  useEffect(() => {
    if (filterStatus) {
      setSelectedOrderStatus(filterStatus);
    }
  }, [filterStatus]);

  const displayOrders = orders.filter(ord => {
    // 1. Order Status Filter
    if (selectedOrderStatus !== 'All') {
      if (selectedOrderStatus === 'Refunded' || selectedOrderStatus === 'Refund') {
        if (ord.orderStatus !== 'Refunded' && ord.paymentStatus !== 'Refunded') {
          return false;
        }
      } else if (ord.orderStatus !== selectedOrderStatus) {
        return false;
      }
    }

    // 2. Payment Mode / Status Filter
    if (selectedPaymentFilter !== 'All') {
      if (selectedPaymentFilter === 'COD') {
        if (ord.paymentMode !== 'COD') return false;
      } else if (selectedPaymentFilter === 'Online') {
        if (ord.paymentMode === 'COD') return false;
      } else if (selectedPaymentFilter === 'Pending') {
        if (ord.paymentStatus !== 'Pending') return false;
      } else if (selectedPaymentFilter === 'Paid') {
        if (ord.paymentStatus !== 'Paid') return false;
      } else if (selectedPaymentFilter === 'Failed') {
        if (ord.paymentStatus !== 'Failed') return false;
      }
    }

    return true;
  });

  const exportToExcel = () => {
    const csvRows = [];
    const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Date', 'Total Amount', 'Payment Mode', 'Payment Status', 'Order Status'];
    csvRows.push(headers.join(','));

    displayOrders.forEach(ord => {
      let formattedDate = 'N/A';
      if (ord.createdAt) {
        const d = new Date(ord.createdAt);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        formattedDate = `="${day}/${month}/${year}"`;
      }

      const row = [
        ord._id,
        `"${(ord.user?.name || 'Guest').replace(/"/g, '""')}"`,
        `"${(ord.user?.email || 'N/A').replace(/"/g, '""')}"`,
        formattedDate,
        ord.totalAmount,
        `"${ord.paymentMode === 'COD' ? 'COD' : 'Online'}"`,
        `"${ord.paymentStatus}"`,
        `"${ord.orderStatus}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'orders_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Pagination Logic
  const totalPages = Math.ceil(displayOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${selectedOrder?._id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            @media print {
              @page { margin: 8mm; size: A4 portrait; }
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
            body { font-family: 'Inter', sans-serif; padding: 0; margin: 0; color: #374151; background: #fff; line-height: 1.3; font-size: 10px; }
            .invoice-wrapper { max-width: 100%; padding: 0 10px; }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #00d2d3; padding-bottom: 10px; margin-bottom: 10px; }
            .invoice-title { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: 1px; text-transform: uppercase; }
            .invoice-meta { font-size: 9px; color: #6b7280; text-align: right; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
            .info-box { background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb; }
            .info-title { font-size: 9px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.5px; }
            .info-text { font-size: 10px; color: #111827; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            .table th, .table td { padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            .table th { background-color: #f3f4f6; color: #374151; font-weight: 600; font-size: 9px; text-transform: uppercase; }
            .text-center { text-align: center !important; }
            .text-end { text-align: right !important; }
            .fw-bold { font-weight: 600; color: #111827; }
            .text-brand { color: #00d2d3; }
            .totals-section { display: flex; justify-content: space-between; border-top: 2px solid #e5e7eb; padding-top: 10px; margin-top: 10px; page-break-inside: avoid; }
            .tax-table th, .tax-table td { padding: 4px; font-size: 9px; }
            .footer-section { margin-top: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; page-break-inside: avoid; }
            .qr-code { width: 60px; height: 60px; border-radius: 4px; }
            .badge-paid { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
            .badge-cod { background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Orders Queue</h1>
          <p className="text-muted m-0">View customer checkouts, ship packages, and verify transaction receipts.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button onClick={exportToExcel} className="btn btn-success d-flex align-items-center gap-2 btn-sm fw-medium px-3 py-2">
            <Download size={16} /> Export to Excel
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4">
        {/* Dropdown Filters Toolbar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Order Status Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="order-status-filter-select" className="fs-7 fw-semibold text-muted text-nowrap m-0 d-flex align-items-center gap-1">
                <Filter size={14} /> Order Status:
              </label>
              <select
                id="order-status-filter-select"
                className="form-select form-select-sm shadow-none border-secondary-subtle rounded-3"
                style={{ minWidth: '160px', cursor: 'pointer' }}
                value={selectedOrderStatus}
                onChange={(e) => {
                  setSelectedOrderStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Order Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Type / Status Dropdown */}
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="payment-filter-select" className="fs-7 fw-semibold text-muted text-nowrap m-0 d-flex align-items-center gap-1">
                <CreditCard size={14} /> Payment Type:
              </label>
              <select
                id="payment-filter-select"
                className="form-select form-select-sm shadow-none border-secondary-subtle rounded-3"
                style={{ minWidth: '170px', cursor: 'pointer' }}
                value={selectedPaymentFilter}
                onChange={(e) => {
                  setSelectedPaymentFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Payment Types</option>
                <option value="Online">Online Transaction</option>
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="Pending">Payment Pending</option>
                <option value="Paid">Payment Paid</option>
                <option value="Failed">Payment Failed</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedOrderStatus !== 'All' || selectedPaymentFilter !== 'All' || filterStatus) && (
              <button
                onClick={() => {
                  setSelectedOrderStatus('All');
                  setSelectedPaymentFilter('All');
                  setCurrentPage(1);
                  if (filterStatus) {
                    router.push('/admin/orders');
                  }
                }}
                className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-3"
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          <span className="badge bg-light text-dark border fs-7 fw-medium px-3 py-2">
            Showing {displayOrders.length} {displayOrders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        {ordersLoading ? (
          <p className="text-muted text-center py-4">Loading system orders...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless align-middle m-0 fs-7">
              <thead>
                <tr className="border-bottom text-muted">
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No orders found{filterStatus ? ` for status: ${filterStatus}` : ''}.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((ord) => (
                    <tr key={ord._id} className="border-bottom">
                    <td className="py-3 fw-bold font-monospace">#{ord._id.substring(0, 10).toUpperCase()}</td>
                    <td>
                      <div>
                        <span className="fw-bold text-dark d-block">{ord.user?.name || 'Guest'}</span>
                        <small className="text-muted">{ord.user?.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold">₹{ord.totalAmount}</td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span className="fw-semibold text-dark">
                          {ord.paymentMode === 'COD' ? 'COD (Cash on Delivery)' : 'Online Transaction'}
                        </span>
                        <small className="text-muted fw-semibold">
                          Status: <span className={ord.paymentStatus === 'Paid' ? 'text-success fw-bold' : 'text-warning fw-bold'}>{ord.paymentStatus}</span>
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className={ord.orderStatus === 'Delivered' ? 'badge-status-green' : ord.orderStatus === 'Cancelled' ? 'badge-status-red' : 'badge-status-orange'}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => setSelectedOrder(ord)} 
                        className="btn btn-brand-secondary btn-sm py-1 px-3 d-inline-flex align-items-center gap-1"
                      >
                        <Eye size={14} /> Process
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!ordersLoading && totalPages > 0 && (
          <div className="d-flex flex-wrap justify-content-between align-items-center pt-4">
            <span className="text-muted fs-7 mb-2 mb-md-0">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, displayOrders.length)} of {displayOrders.length} entries
            </span>
            <nav>
              <ul className="pagination m-0 d-flex align-items-center" style={{ gap: '6px' }}>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none fw-medium" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', color: currentPage === 1 ? '#94a3b8' : '#475569', padding: '6px 14px', fontSize: '14px', backgroundColor: currentPage === 1 ? '#f8fafc' : '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => {
                  if (
                    number === 1 || 
                    number === totalPages || 
                    (number >= currentPage - 1 && number <= currentPage + 1)
                  ) {
                    return (
                      <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                        <button className="page-link shadow-none fw-bold" style={{ borderRadius: '8px', border: currentPage === number ? '1px solid #00d2d3' : '1px solid #e2e8f0', color: currentPage === number ? '#ffffff' : '#475569', padding: '6px 14px', fontSize: '14px', backgroundColor: currentPage === number ? '#00d2d3' : '#ffffff' }} onClick={() => setCurrentPage(number)}>{number}</button>
                      </li>
                    );
                  } else if (
                    number === currentPage - 2 || 
                    number === currentPage + 2
                  ) {
                    return <li key={number} className="page-item disabled"><span className="page-link shadow-none" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', color: '#94a3b8', padding: '6px 14px', fontSize: '14px', backgroundColor: '#f8fafc' }}>...</span></li>;
                  }
                  return null;
                })}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link shadow-none fw-medium" style={{ borderRadius: '8px', border: '1px solid #e2e8f0', color: currentPage === totalPages ? '#94a3b8' : '#475569', padding: '6px 14px', fontSize: '14px', backgroundColor: currentPage === totalPages ? '#f8fafc' : '#ffffff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      </div>

      {/* Details modal overlay */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={closeDetailsModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="modal-title fw-bold m-0">Order Details (#{selectedOrder._id.substring(0, 12).toUpperCase()})</h5>
                  <div className="mt-1">
                    <span className="fw-bold text-dark fs-8">
                      {selectedOrder.paymentMode === 'COD' ? '💵 Cash on Delivery (COD)' : `💳 Online Transaction (${selectedOrder.paymentMode || 'Prepaid'})`}
                    </span>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 ms-auto">
                  <button onClick={handlePrint} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-3 px-3 py-1.5 fw-medium">
                    <Printer size={14} /> Print
                  </button>
                  <button type="button" onClick={closeDetailsModal} className="btn-close ms-2" aria-label="Close"></button>
                </div>
              </div>
              
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {actionSuccess && <div className="alert alert-success p-2 fs-8 mb-3">{actionSuccess}</div>}

                {/* Workflow Action Bar */}
                <div className="p-3 mb-4 rounded-3 border bg-light shadow-sm">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                      <span className="text-muted fs-8 text-uppercase fw-bold d-block mb-1">Payment Method & Status</span>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="fw-bold text-dark fs-7">
                          {selectedOrder.paymentMode === 'COD' ? 'Cash on Delivery (COD)' : 'Online Transaction'}
                        </span>
                        <span className="fs-7 text-muted">
                          Status: <strong className="text-dark">{selectedOrder.orderStatus}</strong> | Payment: <strong className={selectedOrder.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}>{selectedOrder.paymentStatus}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                      {/* Step 1 for COD: Confirm Order */}
                      {selectedOrder.orderStatus === 'Placed' && (
                        <button 
                          onClick={() => handleStatusChange(selectedOrder._id, 'Confirmed')}
                          className="btn btn-primary btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        >
                          <CheckCircle size={16} /> Confirm Order
                        </button>
                      )}

                      {/* Step 2: Confirmed -> Mark as Packed */}
                      {selectedOrder.orderStatus === 'Confirmed' && (
                        <button 
                          onClick={() => handleStatusChange(selectedOrder._id, 'Packed')}
                          className="btn btn-info text-white btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        >
                          <Package size={16} /> Mark as Packed
                        </button>
                      )}

                      {/* Step 3: Packed -> Generate Shipment */}
                      {selectedOrder.orderStatus === 'Packed' && (!selectedOrder.shipments || selectedOrder.shipments.length === 0) && (
                        <button 
                          onClick={() => handleCreateDelhiveryShipment(selectedOrder._id)}
                          className="btn btn-dark btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        >
                          <Truck size={16} /> {warehouses && warehouses.length > 1 ? 'Generate Split Shipments' : 'Generate Shipment'}
                        </button>
                      )}

                      {/* Step 4: Shipped -> Mark as Delivered */}
                      {selectedOrder.orderStatus === 'Shipped' && (
                        <button 
                          onClick={() => handleStatusChange(selectedOrder._id, 'Delivered')}
                          className="btn btn-success btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        >
                          <CheckCircle size={16} /> Mark as Delivered
                        </button>
                      )}

                      {/* Completed state */}
                      {selectedOrder.orderStatus === 'Delivered' && (
                        <span className="badge bg-success px-3 py-2 fs-7 fw-bold d-inline-flex align-items-center gap-1">
                          <CheckCircle size={16} /> Order Delivered
                        </span>
                      )}

                      {/* Cancelled state */}
                      {selectedOrder.orderStatus === 'Cancelled' && (
                        <span className="badge bg-danger px-3 py-2 fs-7 fw-bold d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={16} /> Order Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  {/* Summary */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Customer Profile</h6>
                    <p className="m-0 fw-semibold text-dark">{selectedOrder.user?.name || 'Guest'}</p>
                    <p className="m-0 text-muted fs-7">Email: {selectedOrder.user?.email || 'N/A'}</p>
                    <p className="m-0 text-muted fs-7">Phone: {selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                  {/* Address */}
                  <div className="col-md-6">
                    <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Shipping Destination</h6>
                    <div className="d-flex align-items-start gap-1">
                      <MapPin size={16} className="text-muted mt-1" />
                      <div>
                        <p className="m-0 text-dark fs-7">{selectedOrder.deliveryAddress.street || selectedOrder.deliveryAddress.address || selectedOrder.deliveryAddress.locality}, {selectedOrder.deliveryAddress.city}</p>
                        <p className="m-0 text-muted fs-7">{selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode || selectedOrder.deliveryAddress.pincode}, {selectedOrder.deliveryAddress.country || 'India'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Ordered Items</h6>
                <div className="d-flex flex-column gap-2 mb-4 bg-light p-3 rounded border">
                  {selectedOrder.items.map(item => (
                    <div key={item._id} className="d-flex justify-content-between align-items-center fs-7 border-bottom pb-2">
                      <div>
                        <span className="fw-bold text-dark">{item.name}</span>
                        <small className="text-muted d-block">₹{item.price} x {item.quantity}</small>
                      </div>
                      <span className="fw-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between fs-6 fw-bold text-dark pt-2">
                    <span>Order Total</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {/* Logistics Integration (Multi-Shipment) */}
                <h6 className="fw-bold text-muted uppercase fs-8 mb-2">Shipments (Delhivery)</h6>
                <div className="bg-light p-3 rounded border mb-4 d-flex flex-column gap-3">
                  {(!selectedOrder.shipments || selectedOrder.shipments.length === 0) ? (
                    <div>
                      <p className="fs-7 text-muted m-0 mb-2">
                        {selectedOrder.orderStatus === 'Packed' 
                          ? 'Order is packed. Use the action bar above to generate shipment.' 
                          : selectedOrder.orderStatus === 'Confirmed' 
                            ? 'Order is confirmed. Please mark as Packed before generating shipment.' 
                            : 'No active shipments for this order.'}
                      </p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {selectedOrder.shipments.map((shipment, index) => (
                        <div key={shipment._id || index} className="p-2 border rounded bg-white">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fs-7">
                              Waybill: <strong className="font-monospace">{shipment.waybill}</strong>
                            </span>
                            <span className="badge bg-primary bg-opacity-10 text-primary">
                              {shipment.status || 'Manifested'}
                            </span>
                          </div>
                          <div className="fs-8 text-muted mb-2">
                            Courier: {shipment.courierName} | Shipped: {new Date(shipment.shippedAt).toLocaleDateString()}
                          </div>
                          <div className="d-flex gap-2">
                            <button onClick={() => handleGetLabel(shipment.waybill)} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                              <Printer size={14} /> Shipping Label
                            </button>
                            {shipment.status !== 'Cancelled' && shipment.status !== 'Delivered' && (
                               <button onClick={() => handleCancelDelhiveryShipment(shipment.waybill)} className="btn btn-sm btn-outline-danger">
                                 Cancel
                               </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  
                  
                  {/* Cancel / Refund */}
                  {selectedOrder.orderStatus !== 'Delivered' && user.role === 'Super Admin' && (
                    <div className="d-flex gap-2">
                      {selectedOrder.orderStatus !== 'Cancelled' && (
                        <button 
                          onClick={() => {
                            if (selectedOrder.paymentStatus === 'Paid') {
                              handleRefund(selectedOrder._id);
                            } else {
                              handleStatusChange(selectedOrder._id, 'Cancelled');
                            }
                          }} 
                          className="btn btn-sm btn-danger"
                        >
                          {selectedOrder.paymentStatus === 'Paid' ? 'Cancel & Refund Order' : 'Cancel Order'}
                        </button>
                      )}
                      {selectedOrder.orderStatus === 'Cancelled' && selectedOrder.paymentStatus === 'Paid' && (
                        <button 
                          onClick={() => handleRefund(selectedOrder._id)} 
                          className="btn btn-sm btn-warning fw-bold text-dark"
                        >
                          Process Refund
                        </button>
                      )}
                    </div>
                  )}
                <div className="fs-8 text-muted border-top pt-3 mt-3">
                  <div className="mb-2">
                    Payment Method: <strong className="text-dark">{selectedOrder.paymentMode === 'COD' ? 'Cash on Delivery (COD)' : 'Online Transaction (' + (selectedOrder.paymentMode || 'Prepaid') + ')'}</strong> | Current Status: <strong className="text-dark">{selectedOrder.orderStatus}</strong> | Payment Status: <strong className="text-dark">{selectedOrder.paymentStatus}</strong>
                  </div>
                  {(selectedOrder.gatewayTxnId) && (
                    <div className="bg-light p-3 rounded border mt-3">
                      <h6 className="fw-bold text-dark fs-8 mb-2 text-uppercase">Transaction Details</h6>
                      <div className="d-flex flex-column gap-1">
                        {(selectedOrder.gatewayTxnId) && (
                          <div className="d-flex justify-content-between">
                            <span>Gateway Txn ID:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.gatewayTxnId}</span>
                          </div>
                        )}
                        {selectedOrder.bankRefNo && (
                          <div className="d-flex justify-content-between">
                            <span>Bank Ref No:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.bankRefNo}</span>
                          </div>
                        )}
                        {selectedOrder.paymentStatus === 'Paid' && (
                          <div className="d-flex justify-content-between">
                            <span>Payment Processed (Approx):</span>
                            <span className="text-dark fw-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer border-top py-2">
                <button type="button" onClick={closeDetailsModal} className="btn btn-sm btn-brand-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Invoice - Premium Single Page Design */}
      {selectedOrder && (
        <div id="printable-invoice" className="d-none">
          {/* Header */}
          <div className="invoice-header">
            <div>
              <div className="invoice-title">Tax Invoice</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>
                <span className="fw-bold">Invoice No:</span> ST-{selectedOrder._id.substring(0, 10).toUpperCase()} &nbsp;|&nbsp; 
                <span className="fw-bold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '10px', marginTop: '2px' }}>
                <span className="fw-bold">IRN:</span> 4ecf1455f213378bf{selectedOrder._id.substring(0, 6)}a0db3dd8fd9e{selectedOrder._id.substring(6, 12)}59bed15e10d4c6f86eee4add3
              </div>
            </div>
            <div className="invoice-meta d-flex align-items-center gap-3">
              <div className="text-end">
                <div><span className={selectedOrder.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-cod'}>{selectedOrder.paymentStatus === 'Paid' ? 'PREPAID' : 'COD'}</span></div>
                <div style={{ marginTop: '4px' }}><strong>Ack No:</strong> 18262310{selectedOrder._id.substring(0, 6).replace(/[^0-9]/g, '8')}84</div>
              </div>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('https://maxglow.in/invoice/' + selectedOrder._id)}`} 
                alt="e-invoice QR" 
                className="qr-code"
              />
            </div>
          </div>

          {/* Addresses */}
          <div className="grid-2">
            <div className="info-box">
              <div className="info-title">Billed By (Seller)</div>
              <div className="info-text">
                <div className="fw-bold text-brand" style={{ fontSize: '12px' }}>MaxGlow Enterprises</div>
                <div>33, Maharshi Devendra Road, Kolkata - 700006</div>
                <div><strong>GSTIN:</strong> 19AAACC1234D1Z5 &nbsp;|&nbsp; <strong>State Code:</strong> 19 (WB)</div>
                <div><strong>FSSAI:</strong> 12819019002064 &nbsp;|&nbsp; <strong>UDYAM:</strong> WB-10-0002145</div>
              </div>
            </div>
            <div className="info-box">
              <div className="info-title">Billed To (Buyer)</div>
              <div className="info-text">
                <div className="fw-bold" style={{ fontSize: '12px' }}>{selectedOrder.user?.name || 'Guest Customer'}</div>
                <div>{selectedOrder.deliveryAddress.street || selectedOrder.deliveryAddress.address || selectedOrder.deliveryAddress.locality}</div>
                <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode || selectedOrder.deliveryAddress.pincode}</div>
                <div><strong>Phone:</strong> {selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone || 'N/A'}</div>
                <div><strong>Place of Supply:</strong> {selectedOrder.deliveryAddress.state} ({getStateCode(selectedOrder.deliveryAddress.state)})</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="table">
            <thead>
              <tr>
                <th className="text-center" width="5%">#</th>
                <th width="40%">Item Description</th>
                <th className="text-center" width="10%">HSN/SAC</th>
                <th className="text-center" width="10%">Qty</th>
                <th className="text-end" width="15%">Net Rate (₹)</th>
                <th className="text-end" width="20%">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, idx) => {
                const basePrice = Math.round((item.price / 1.05) * 100) / 100;
                const taxAmt = Math.round((item.price - basePrice) * 100) / 100;
                return (
                  <tr key={item._id}>
                    <td className="text-center">{idx + 1}</td>
                    <td>
                      <div className="fw-bold">{item.name}</div>
                      <div style={{ fontSize: '8px', color: '#6b7280' }}>CGST: 2.5% | SGST: 2.5%</div>
                    </td>
                    <td className="text-center">08013220</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{basePrice.toFixed(2)}</td>
                    <td className="text-end fw-bold">
                      <div>{(basePrice * item.quantity).toFixed(2)}</div>
                      <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: 'normal' }}>
                        + Tax: {(taxAmt * item.quantity).toFixed(2)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shippingFee > 0 && (
                <tr>
                  <td className="text-center"></td>
                  <td>
                    <div className="fw-bold">Shipping Charges</div>
                    <div style={{ fontSize: '8px', color: '#6b7280' }}>CGST: 2.5% | SGST: 2.5%</div>
                  </td>
                  <td className="text-center">996511</td>
                  <td className="text-center">1</td>
                  <td className="text-end">{shippingTaxable.toFixed(2)}</td>
                  <td className="text-end fw-bold">
                    <div>{shippingTaxable.toFixed(2)}</div>
                    <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: 'normal' }}>
                      + Tax: {(shippingCGST + shippingSGST).toFixed(2)}
                    </div>
                  </td>
                </tr>
              )}
              {couponDiscount > 0 && (
                <tr>
                  <td colSpan="5" className="text-end" style={{ color: '#059669' }}>Coupon Discount ({selectedOrder.couponCode})</td>
                  <td className="text-end fw-bold" style={{ color: '#059669' }}>-₹{couponDiscount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals & Tax Summary */}
          <div className="totals-section">
            <div style={{ width: '60%' }}>
              <div className="info-title">Tax Summary</div>
              <table className="table tax-table" style={{ border: '1px solid #e5e7eb', marginBottom: '5px' }}>
                <thead>
                  <tr>
                    <th>HSN/SAC</th>
                    <th className="text-end">Taxable</th>
                    <th className="text-end">CGST (2.5%)</th>
                    <th className="text-end">SGST (2.5%)</th>
                    <th className="text-end">Total Tax</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>08013220</td>
                    <td className="text-end">₹{totalTaxable.toFixed(2)}</td>
                    <td className="text-end">₹{totalCGST.toFixed(2)}</td>
                    <td className="text-end">₹{totalSGST.toFixed(2)}</td>
                    <td className="text-end">₹{(totalCGST + totalSGST).toFixed(2)}</td>
                  </tr>
                  {shippingFee > 0 && (
                    <tr>
                      <td>996511</td>
                      <td className="text-end">₹{shippingTaxable.toFixed(2)}</td>
                      <td className="text-end">₹{shippingCGST.toFixed(2)}</td>
                      <td className="text-end">₹{shippingSGST.toFixed(2)}</td>
                      <td className="text-end">₹{(shippingCGST + shippingSGST).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="fw-bold" style={{ backgroundColor: '#f9fafb' }}>
                    <td>Total</td>
                    <td className="text-end">₹{(totalTaxable + shippingTaxable).toFixed(2)}</td>
                    <td className="text-end">₹{(totalCGST + shippingCGST).toFixed(2)}</td>
                    <td className="text-end">₹{(totalSGST + shippingSGST).toFixed(2)}</td>
                    <td className="text-end">₹{(totalCGST + totalSGST + shippingCGST + shippingSGST).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: '9px' }}>
                <span className="fw-bold">Tax Amount in Words:</span> {numberToWords(totalCGST + totalSGST + shippingCGST + shippingSGST)}
              </div>
            </div>
            
            <div style={{ width: '35%', background: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div className="d-flex justify-content-between mb-2">
                <span>Taxable Amount:</span>
                <span className="fw-bold">₹{(totalTaxable + shippingTaxable).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Tax:</span>
                <span className="fw-bold">₹{(totalCGST + totalSGST + shippingCGST + shippingSGST).toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount:</span>
                  <span className="fw-bold">-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {Math.abs(roundOff) > 0.01 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Round Off:</span>
                  <span className="fw-bold">{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: '2px dashed #d1d5db', fontSize: '14px' }}>
                <span className="fw-bold">Grand Total:</span>
                <span className="fw-bold text-brand">₹{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-end mt-1 fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                {numberToWords(selectedOrder.totalAmount)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer-section">
            <div style={{ width: '60%' }}>
              <div className="info-title">Bank Details</div>
              <div style={{ fontSize: '9px' }}>
                <strong>Bank:</strong> ICICI Bank &nbsp;|&nbsp; <strong>Branch:</strong> POSTA BRANCH (ICIC0003395)<br/>
                <strong>A/c Name:</strong> MaxGlow Enterprises &nbsp;|&nbsp; <strong>A/c No:</strong> 339505000253
              </div>
              <div className="info-title" style={{ marginTop: '10px' }}>Declaration</div>
              <div style={{ fontSize: '8px', color: '#6b7280' }}>
                We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              </div>
            </div>
            <div className="d-flex gap-4">
              <div className="text-center d-flex flex-column justify-content-end">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent('upi://pay?pa=maxglow2026@icici&pn=MaxGlow%20Enterprises&am=' + selectedOrder.totalAmount + '&cu=INR')}`} 
                  alt="UPI QR" 
                  style={{ width: '50px', height: '50px', margin: '0 auto 5px' }}
                />
                <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Scan to Pay</div>
              </div>
              <div className="text-center d-flex flex-column justify-content-between" style={{ minWidth: '120px' }}>
                <div className="fw-bold text-end" style={{ fontSize: '10px' }}>For MaxGlow Enterprises</div>
                <div style={{ borderTop: '1px solid #111', paddingTop: '4px', fontSize: '9px', fontWeight: 'bold' }}>
                  Authorised Signatory
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3 pt-2" style={{ borderTop: '1px solid #e5e7eb', fontSize: '8px', color: '#9ca3af' }}>
            SUBJECT TO KOLKATA JURISDICTION &nbsp;|&nbsp; This is a Computer Generated Invoice
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading orders queue...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
