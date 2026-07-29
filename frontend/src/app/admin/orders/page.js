"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';


import Image from 'next/image';


import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminOrders, updateOrderStatus, refundOrder, createDelhiveryShipment, cancelDelhiveryShipment, getDelhiveryLabel, fetchWarehouses } from '../../../store/adminSlice';
import { ShoppingBag, Eye, MapPin, Check, Filter, Clock, Search, X, Printer, Package, Truck, CheckCircle, CreditCard, RotateCcw, AlertTriangle } from 'lucide-react';


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
    dispatch(fetchAdminOrders());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const handleStatusChange = (id, status) => {
    setActionSuccess('');
    dispatch(updateOrderStatus({ id, status, trackingNumber: status === 'Shipped' ? trackingNumber : undefined }))
      .unwrap()
      .then((updatedOrder) => {
        setActionSuccess(`Order status advanced to ${status}!`);
        setSelectedOrder(updatedOrder);
        dispatch(fetchAdminOrders());
      })
      .catch((err) => {
        showAlert(err || 'Failed to update order status', 'error');
      });
  };

  const handleRefund = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this order and record it as refunded? (You must initiate the actual refund in your Razorpay Dashboard)');
    if (confirmed) {
      setActionSuccess('');
      dispatch(refundOrder(id))
        .unwrap()
        .then((updatedOrder) => {
          setActionSuccess('Order cancelled and refund recorded. Please process actual refund via Razorpay.');
          setSelectedOrder(updatedOrder);
          dispatch(fetchAdminOrders());
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
          dispatch(fetchAdminOrders());
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
          dispatch(fetchAdminOrders());
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

  const displayOrders = filterStatus 
    ? orders.filter(ord => ord.orderStatus === filterStatus)
    : orders;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice').innerHTML;
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    printWindow.document.write(`
      <html>
        <head>
          <title>Tax Invoice - ${selectedOrder._id.substring(0, 10).toUpperCase()}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 10px; }
            .invoice-box {
              border: 1.5px solid #000;
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 0;
            }
            .invoice-table {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 0;
            }
            .invoice-table th, .invoice-table td {
              border: 1px solid #000;
              padding: 4px 6px;
              font-size: 11px;
              vertical-align: top;
            }
            .invoice-table th {
              background-color: #f2f2f2;
              text-align: center;
              font-weight: bold;
            }
            .text-center { text-align: center; }
            .text-end { text-align: right; }
            .text-start { text-align: left; }
            .fw-bold { font-weight: bold; }
            .border-bottom { border-bottom: 1px solid #000; }
            .border-top { border-top: 1px solid #000; }
            .border-right { border-right: 1px solid #000; }
            .no-border { border: none !important; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent}
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
        {filterStatus && (
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-brand text-white fs-7 px-3 py-2">
              <Filter size={14} className="me-1" /> Filter: {filterStatus}
            </span>
            <Link href="/admin/orders" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
              <X size={14} /> Clear
            </Link>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4">
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
                {displayOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No orders found{filterStatus ? ` for status: ${filterStatus}` : ''}.
                    </td>
                  </tr>
                ) : (
                  displayOrders.map((ord) => (
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
                      <span className={ord.paymentStatus === 'Paid' ? 'badge bg-success bg-opacity-10 text-success' : 'badge bg-warning bg-opacity-10 text-warning'}>
                        {ord.paymentStatus}
                      </span>
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
      </div>
      </div>

      {/* Details modal overlay */}
      {selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={closeDetailsModal}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold">Order Details (#{selectedOrder._id.substring(0, 12).toUpperCase()})</h5>
                <div className="d-flex gap-2 align-items-center">
                  {(selectedOrder.orderStatus === 'Confirmed' || selectedOrder.orderStatus === 'Packed' || selectedOrder.orderStatus === 'Shipped' || selectedOrder.orderStatus === 'Delivered') && (
                    <button onClick={handlePrint} className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1">
                      <Printer size={14} /> Print
                    </button>
                  )}
                  <button type="button" onClick={closeDetailsModal} className="btn-close"></button>
                </div>
              </div>
              
              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {actionSuccess && <div className="alert alert-success p-2 fs-8 mb-3">{actionSuccess}</div>}

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
                      <p className="fs-7 text-muted m-0 mb-2">No active shipments for this order.</p>
                      {(selectedOrder.orderStatus === 'Packed' || selectedOrder.orderStatus === 'Confirmed' || selectedOrder.orderStatus === 'Placed') && (
                        <button onClick={() => handleCreateDelhiveryShipment(selectedOrder._id)} className="btn btn-sm btn-dark d-flex align-items-center gap-2">
                          <Truck size={14} /> {warehouses && warehouses.length > 1 ? 'Generate Split Shipments' : 'Generate Shipment'}
                        </button>
                      )}
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
                  {selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && user.role === 'Super Admin' && (
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
                <div className="fs-8 text-muted border-top pt-3 mt-3">
                  <div className="mb-2">
                    Current Status: <strong className="text-dark">{selectedOrder.orderStatus}</strong> | Payment Status: <strong className="text-dark">{selectedOrder.paymentStatus}</strong>
                  </div>
                  {(selectedOrder.razorpayOrderId || selectedOrder.razorpayPaymentId) && (
                    <div className="bg-light p-3 rounded border mt-3">
                      <h6 className="fw-bold text-dark fs-8 mb-2 text-uppercase">Transaction Details</h6>
                      <div className="d-flex flex-column gap-1">
                        {selectedOrder.razorpayOrderId && (
                          <div className="d-flex justify-content-between">
                            <span>Razorpay Order ID:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.razorpayOrderId}</span>
                          </div>
                        )}
                        {selectedOrder.razorpayPaymentId && (
                          <div className="d-flex justify-content-between">
                            <span>Razorpay Payment ID:</span>
                            <span className="text-dark fw-medium font-monospace">{selectedOrder.razorpayPaymentId}</span>
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

      {/* Hidden Printable Invoice - Flipkart Style */}
      {selectedOrder && (
        <div id="printable-invoice" className="d-none">
          <div className="invoice-box">
            {/* Title */}
            <div className="text-center fw-bold border-bottom py-2" style={{ fontSize: '14px', textTransform: 'uppercase' }}>
              Tax Invoice
            </div>
            
            {/* IRN Block */}
            <div className="row g-0 border-bottom p-2">
              <div className="col-8">
                <div><strong>IRN:</strong> 4ecf1455f213378bf{selectedOrder._id.substring(0, 6)}a0db3dd8fd9e{selectedOrder._id.substring(6, 12)}59bed15e10d4c6f86eee4add3</div>
                <div><strong>Ack No.:</strong> 18262310{selectedOrder._id.substring(0, 6).replace(/[^0-9]/g, '8')}84</div>
                <div><strong>Ack Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="col-4 text-end d-flex align-items-center justify-content-end gap-2">
                <div style={{ fontSize: '9px', fontWeight: 'bold' }}>e-Invoice</div>
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent('https://www.maxglowon.com/invoice/' + selectedOrder._id)}`} 
                  alt="e-invoice QR" 
                  width={60}
                  height={60}
                  style={{ width: '60px', height: '60px' }} 
                />
              </div>
            </div>

            {/* Seller & Invoice Metadata */}
            <table className="invoice-table" style={{ borderTop: 'none', borderBottom: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ width: '55%', borderTop: 'none', borderLeft: 'none' }} className="border-right">
                    <div className="fw-bold" style={{ fontSize: '12px' }}>MaxGlow Enterprises - FY 2026-27 - (from 1-Apr-26)</div>
                    <div>33, Maharshi Devendra Road, Kolkata - 700006</div>
                    <div>FSSAI NO: 12819019002064</div>
                    <div>UDYAM REGN: UDYAM-WB-10-0002145 (MICRO)</div>
                    <div><strong>GSTIN/UIN:</strong> 19AAACC1234D1Z5</div>
                    <div><strong>State Name:</strong> West Bengal, Code : 19</div>
                  </td>
                  <td style={{ width: '45%', padding: '0', borderTop: 'none', borderRight: 'none' }}>
                    <table style={{ width: '100%', height: '100%', border: 'none' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ width: '50%', border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Invoice No.</div>
                            <div className="fw-bold">ST-{selectedOrder._id.substring(0, 10).toUpperCase()}</div>
                          </td>
                          <td style={{ width: '50%', border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Dated</div>
                            <div className="fw-bold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Delivery Note</div>
                            <div className="fw-bold">-</div>
                          </td>
                          <td style={{ border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Mode/Terms of Payment</div>
                            <div className="fw-bold">{selectedOrder.paymentStatus === 'Paid' ? 'Prepaid' : 'COD'}</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Reference No. and Date</div>
                            <div className="fw-bold">-</div>
                          </td>
                          <td style={{ border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Other References</div>
                            <div className="fw-bold">-</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Buyer's Order No.</div>
                            <div className="fw-bold">-</div>
                          </td>
                          <td style={{ border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Dated</div>
                            <div className="fw-bold">-</div>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                          <td style={{ border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Dispatch Doc No.</div>
                            <div className="fw-bold">-</div>
                          </td>
                          <td style={{ border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Delivery Note Date</div>
                            <div className="fw-bold">-</div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', borderRight: '1px solid #000', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Dispatched through</div>
                            <div className="fw-bold">Courier</div>
                          </td>
                          <td style={{ border: 'none', padding: '4px' }}>
                            <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Destination</div>
                            <div className="fw-bold">{selectedOrder.deliveryAddress.city}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                {/* Buyer row */}
                <tr style={{ borderTop: '1px solid #000' }}>
                  <td style={{ width: '55%', borderLeft: 'none' }} className="border-right">
                    <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Buyer (Bill to)</div>
                    <div className="fw-bold" style={{ fontSize: '12px' }}>{selectedOrder.user?.name || 'Guest Customer'}</div>
                    <div>{selectedOrder.deliveryAddress.street || selectedOrder.deliveryAddress.address || selectedOrder.deliveryAddress.locality}</div>
                    <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode || selectedOrder.deliveryAddress.pincode}</div>
                    <div><strong>Phone:</strong> {selectedOrder.deliveryAddress?.phone || selectedOrder.user?.phone || 'N/A'}</div>
                    <div><strong>State Name:</strong> {selectedOrder.deliveryAddress.state}, Code : {getStateCode(selectedOrder.deliveryAddress.state)}</div>
                    <div><strong>Place of Supply:</strong> {selectedOrder.deliveryAddress.state}</div>
                  </td>
                  <td style={{ width: '45%', borderRight: 'none' }}>
                    <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#666' }}>Terms of Delivery</div>
                    <div style={{ marginTop: '5px' }}>Standard door-step delivery within 3-5 business days.</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Product Table */}
            <table className="invoice-table" style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
              <thead>
                <tr className="text-center" style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ width: '5%', borderLeft: 'none' }}>SI No.</th>
                  <th style={{ width: '40%' }}>Description of Goods</th>
                  <th style={{ width: '10%' }}>HSN/SAC</th>
                  <th style={{ width: '10%' }}>Quantity</th>
                  <th style={{ width: '10%' }}>Rate (incl. of Tax)</th>
                  <th style={{ width: '10%' }}>Rate</th>
                  <th style={{ width: '5%' }}>per</th>
                  <th style={{ width: '10%', borderRight: 'none' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => {
                  const basePrice = Math.round((item.price / 1.05) * 100) / 100;
                  const taxAmt = Math.round((item.price - basePrice) * 100) / 100;
                  
                  return (
                    <tr key={item._id} style={{ borderBottom: 'none' }}>
                      <td className="text-center" style={{ borderLeft: 'none' }}>{idx + 1}</td>
                      <td>
                        <div className="fw-bold">{item.name}</div>
                        <div style={{ fontSize: '9px', textIndent: '10px', color: '#555' }}>CGST 2.5%</div>
                        <div style={{ fontSize: '9px', textIndent: '10px', color: '#555' }}>SGST 2.5%</div>
                      </td>
                      <td className="text-center">08013220</td>
                      <td className="text-center">{item.quantity}.0000 Pcs</td>
                      <td className="text-center">₹{item.price.toFixed(2)}</td>
                      <td className="text-center">₹{basePrice.toFixed(2)}</td>
                      <td className="text-center">Pcs</td>
                      <td className="text-end fw-bold" style={{ borderRight: 'none' }}>
                        <div>₹{(basePrice * item.quantity).toFixed(2)}</div>
                        <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#555' }}>₹{(taxAmt / 2 * item.quantity).toFixed(2)}</div>
                        <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#555' }}>₹{(taxAmt / 2 * item.quantity).toFixed(2)}</div>
                      </td>
                    </tr>
                  );
                })}

                {/* Shipping Fee Rows */}
                {shippingFee > 0 && (
                  <tr>
                    <td className="text-center" style={{ borderLeft: 'none' }}></td>
                    <td>
                      <div className="fw-bold">Shipping Charges</div>
                      <div style={{ fontSize: '9px', textIndent: '10px', color: '#555' }}>CGST 2.5%</div>
                      <div style={{ fontSize: '9px', textIndent: '10px', color: '#555' }}>SGST 2.5%</div>
                    </td>
                    <td className="text-center">996511</td>
                    <td className="text-center">1.0000 Pcs</td>
                    <td className="text-center">₹{shippingFee.toFixed(2)}</td>
                    <td className="text-center">₹{shippingTaxable.toFixed(2)}</td>
                    <td className="text-center">Pcs</td>
                    <td className="text-end fw-bold" style={{ borderRight: 'none' }}>
                      <div>₹{shippingTaxable.toFixed(2)}</div>
                      <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#555' }}>₹{shippingCGST.toFixed(2)}</div>
                      <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#555' }}>₹{shippingSGST.toFixed(2)}</div>
                    </td>
                  </tr>
                )}

                {/* Coupon discount row */}
                {couponDiscount > 0 && (
                  <tr>
                    <td className="text-center" style={{ borderLeft: 'none' }}></td>
                    <td>
                      <div className="fw-bold text-success">Coupon Discount ({selectedOrder.couponCode})</div>
                    </td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-end fw-bold text-success" style={{ borderRight: 'none' }}>-₹{couponDiscount.toFixed(2)}</td>
                  </tr>
                )}

                {/* Round Off row */}
                {Math.abs(roundOff) > 0.01 && (
                  <tr>
                    <td className="text-center" style={{ borderLeft: 'none' }}></td>
                    <td>
                      <div className="fw-bold">Round Off</div>
                    </td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-end fw-bold" style={{ borderRight: 'none' }}>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</td>
                  </tr>
                )}

                {/* Totals row */}
                <tr className="fw-bold" style={{ backgroundColor: '#f2f2f2' }}>
                  <td style={{ borderLeft: 'none' }}></td>
                  <td>Total</td>
                  <td></td>
                  <td className="text-center">{totalQty}.0000 Pcs</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="text-end" style={{ borderRight: 'none' }}>₹{selectedOrder.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Amount in words */}
            <div className="p-2 border-bottom">
              <div>Amount Chargeable (in words):</div>
              <div className="fw-bold text-uppercase">{numberToWords(selectedOrder.totalAmount)}</div>
            </div>

            {/* Tax breakdown & QR Block */}
            <div className="row g-0 border-bottom">
              <div className="col-3 p-2 border-end d-flex flex-column align-items-center justify-content-center">
                <div style={{ fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>Scan to Pay</div>
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('upi://pay?pa=maxglow2026@icici&pn=MaxGlow%20Enterprises&am=' + selectedOrder.totalAmount + '&cu=INR')}`} 
                  alt="UPI QR Code" 
                  width={80}
                  height={80}
                  style={{ width: '80px', height: '80px' }} 
                />
              </div>
              <div className="col-9">
                <table className="invoice-table" style={{ border: 'none' }}>
                  <thead>
                    <tr className="text-center" style={{ backgroundColor: '#f2f2f2' }}>
                      <th style={{ borderLeft: 'none', borderTop: 'none' }}>HSN/SAC</th>
                      <th style={{ borderTop: 'none' }}>Taxable Value</th>
                      <th style={{ borderTop: 'none' }}>CGST Rate/Amt</th>
                      <th style={{ borderTop: 'none' }}>SGST Rate/Amt</th>
                      <th style={{ borderRight: 'none', borderTop: 'none' }}>Total Tax Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td style={{ borderLeft: 'none' }}>08013220</td>
                      <td>₹{totalTaxable.toFixed(2)}</td>
                      <td>2.5% / ₹{totalCGST.toFixed(2)}</td>
                      <td>2.5% / ₹{totalSGST.toFixed(2)}</td>
                      <td className="fw-bold text-end" style={{ borderRight: 'none' }}>₹{(totalCGST + totalSGST).toFixed(2)}</td>
                    </tr>
                    {shippingFee > 0 && (
                      <tr className="text-center">
                        <td style={{ borderLeft: 'none' }}>996511</td>
                        <td>₹{shippingTaxable.toFixed(2)}</td>
                        <td>2.5% / ₹{shippingCGST.toFixed(2)}</td>
                        <td>2.5% / ₹{shippingSGST.toFixed(2)}</td>
                        <td className="fw-bold text-end" style={{ borderRight: 'none' }}>₹{(shippingCGST + shippingSGST).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="fw-bold text-center" style={{ backgroundColor: '#f2f2f2' }}>
                      <td style={{ borderLeft: 'none' }}>Total</td>
                      <td>₹{(totalTaxable + shippingTaxable).toFixed(2)}</td>
                      <td>₹{(totalCGST + shippingCGST).toFixed(2)}</td>
                      <td>₹{(totalSGST + shippingSGST).toFixed(2)}</td>
                      <td className="text-end" style={{ borderRight: 'none' }}>₹{(totalCGST + totalSGST + shippingCGST + shippingSGST).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="p-2 border-top">
                  <div>Tax Amount (in words):</div>
                  <div className="fw-bold text-uppercase">{numberToWords(totalCGST + totalSGST + shippingCGST + shippingSGST)}</div>
                </div>
              </div>
            </div>

            {/* Footer Declarations & Signatures */}
            <table className="invoice-table" style={{ border: 'none', pageBreakInside: 'avoid' }}>
              <tbody>
                <tr style={{ border: 'none' }}>
                  <td style={{ width: '55%', border: 'none', borderRight: '1px solid #000', verticalAlign: 'top', padding: '10px' }}>
                    <div className="fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Declaration:</div>
                    <div style={{ fontSize: '10px' }}>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</div>
                    
                    <div style={{ marginTop: '15px' }} className="fw-bold">Company's Bank Details:</div>
                    <div>Bank Name: <strong>ICICI Bank</strong></div>
                    <div>A/c Holder's Name: <strong>MaxGlow Enterprises</strong></div>
                    <div>A/c No.: <strong>339505000253</strong></div>
                    <div>Branch & IFS Code: <strong>POSTA BRANCH & ICIC0003395</strong></div>
                    
                    <div style={{ borderTop: '1px solid #000', marginTop: '40px', paddingTop: '5px', width: '150px' }} className="text-center">
                      Customer's Seal and Signature
                    </div>
                  </td>
                  <td style={{ width: '45%', border: 'none', verticalAlign: 'top', padding: '10px', textAlign: 'right' }}>
                    <div className="fw-bold text-end">for MaxGlow Enterprises</div>
                    <div style={{ marginTop: '140px', borderTop: '1px solid #000', paddingTop: '5px', width: '180px', display: 'inline-block' }} className="text-center fw-bold">
                      Authorised Signatory
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom centered lines */}
            <div className="text-center py-2 border-top" style={{ fontSize: '10px' }}>
              <div className="fw-bold">SUBJECT TO KOLKATA JURISDICTION</div>
              <div>This is a Computer Generated Invoice</div>
            </div>

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
