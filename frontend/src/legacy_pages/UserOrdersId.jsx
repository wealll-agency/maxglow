"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';


import Image from 'next/image';


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, trackDelhiveryShipment, createRefundRequest } from '@/store/ordersSlice';
import { clearCart } from '@/store/cartSlice';


import { ShieldCheck, MapPin, Truck, Check, Calendar, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { activeOrder: order, orderLoading } = useSelector((state) => state.orders);
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { showAlert } = useNotification();
  
  const [trackingData, setTrackingData] = useState({});
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(null); // 'cancel' or 'refund'
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [hasRefundPermission, setHasRefundPermission] = useState(true);
  
  const isNewSuccess = searchParams.get('success') === 'true';

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isNewSuccess) {
      dispatch(clearCart());
    }
  }, [isNewSuccess, dispatch]);

  useEffect(() => {
    setMounted(true);

    const fetchGlobalSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api';
        const res = await fetch(`${apiUrl}/auth/settings?t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setHasRefundPermission(data.settings.refund !== false);
        }
      } catch (err) {
        console.error('Failed to fetch system settings', err);
      }
    };
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) {
      router.push(`/login?redirect=user/orders/${id}`);
    }
  }, [user, authLoading, mounted, router, id]);

  useEffect(() => {
    if (user && !authLoading && id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [dispatch, id, user, authLoading]);

  useEffect(() => {
    if (order && order.shipments && order.shipments.length > 0) {
      setTrackingLoading(true);
      
      const promises = order.shipments.map(shipment => 
        dispatch(trackDelhiveryShipment(shipment.waybill)).unwrap()
          .then(res => {
            if (res && res.tracking && res.tracking.ShipmentData && res.tracking.ShipmentData.length > 0) {
              setTrackingData(prev => ({
                ...prev,
                [shipment.waybill]: res.tracking.ShipmentData[0].Shipment
              }));
            }
          })
          .catch(err => console.error(err))
      );

      Promise.all(promises).finally(() => setTrackingLoading(false));
    }
  }, [dispatch, order]);

  const handleRefundSubmit = async () => {
    if (!refundReason.trim()) return;
    setRefundSubmitting(true);
    try {
      await dispatch(createRefundRequest({ 
        orderId: id, 
        reason: showRefundModal === 'cancel' ? 'Cancellation' : 'Refund', 
        customerComment: refundReason 
      })).unwrap();
      setShowRefundModal(null);
      setRefundReason('');
      dispatch(fetchOrderDetails(id));
      showAlert('Request submitted successfully.', 'success');
    } catch (err) {
      showAlert(err || 'Failed to submit request', 'error');
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (!mounted || authLoading || !user) {
    return (
      <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success mb-3" role="status">
          <span className="visually-hidden">Checking authentication...</span>
        </div>
        <p className="text-muted">Verifying your session...</p>
      </div>
    );
  }

  const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];
  const currentStepIndex = order ? steps.indexOf(order.orderStatus) : 0;

  const getStepStatus = (index) => {
    if (!order) return 'pending';
    if (order.orderStatus === 'Cancelled') {
      return 'cancelled';
    }
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="container py-5">
      
      {/* Success banner */}
      {isNewSuccess && (
        <div className="alert alert-success p-4 rounded-4 shadow-sm mb-4 border d-flex flex-column align-items-center text-center">
          <div className="rounded-circle p-3 mb-2 bg-success text-white">
            <Check size={32} />
          </div>
          <h3 className="fw-bold m-0 display-font text-success">Order Placed Successfully!</h3>
          <p className="text-muted m-0 mt-1">Thank you for your purchase. We are processing your order.</p>
        </div>
      )}

      {/* Back button */}
      <div className="mb-4">
        <Link href="/user/orders" className="text-decoration-none text-muted hover-green d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      {orderLoading || !order ? (
        <div className="row g-5">
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4" style={{ minHeight: '180px', opacity: 0.6 }}>
              <div className="bg-light rounded mb-3" style={{ width: '150px', height: '24px' }}></div>
              <div className="d-flex justify-content-between gap-2 mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="text-center" style={{ flex: 1 }}>
                    <div className="bg-light rounded-circle mx-auto mb-2" style={{ width: '32px', height: '32px' }}></div>
                    <div className="bg-light rounded mx-auto" style={{ width: '50px', height: '12px' }}></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ minHeight: '150px', opacity: 0.6 }}>
              <div className="bg-light rounded mb-3" style={{ width: '120px', height: '20px' }}></div>
              <div className="bg-light rounded" style={{ width: '100%', height: '50px' }}></div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ minHeight: '200px', opacity: 0.6 }}>
              <div className="bg-light rounded mb-3" style={{ width: '100px', height: '20px' }}></div>
              <div className="bg-light rounded mt-2" style={{ width: '100%', height: '100px' }}></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-5">
        
        {/* Left Side */}
        <div className="col-lg-8">
          
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 border-bottom pb-3 mb-3">
              <div>
                <h5 className="fw-bold m-0 text-dark">Order ID: #{order._id.substring(0, 12).toUpperCase()}</h5>
                <small className="text-muted">Placed on: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</small>
              </div>
              <div className="d-flex flex-column align-items-sm-end">
                <span className="fs-5 fw-bold text-dark">₹{order.totalAmount}</span>
                <small className="badge bg-success-subtle text-success mt-1">{order.paymentStatus}</small>
              </div>
            </div>

            {/* Address */}
            <div className="d-flex align-items-start gap-2 mb-3">
              <MapPin size={20} className="text-muted mt-1" />
              <div>
                <h6 className="fw-bold m-0">Shipping Destination:</h6>
                <p className="m-0 text-muted fs-7 mt-1">{order.deliveryAddress.street || order.deliveryAddress.address || order.deliveryAddress.locality}, {order.deliveryAddress.city}</p>
                <p className="m-0 text-muted fs-7">{order.deliveryAddress.state} - {order.deliveryAddress.zipCode || order.deliveryAddress.pincode}, {order.deliveryAddress.country || 'India'}</p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="d-flex align-items-start gap-2 pt-2 border-top">
                <Truck size={20} className="text-muted mt-1" />
                <div>
                  <h6 className="fw-bold m-0">Tracking Reference:</h6>
                  <p className="m-0 text-success fw-bold font-monospace fs-7 mt-1">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items Recap */}
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <h5 className="fw-bold mb-3">Purchased Items</h5>
            
            <div className="d-flex flex-column gap-3">
              {order.items.map((item, index) => (
                <div key={item._id || index} className="d-flex align-items-center justify-content-between border-bottom pb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="product-img-box m-0 p-0" 
                      style={{ width: '80px', height: '80px', flexShrink: 0, overflow: 'hidden', border: '1px solid #eee', borderRadius: '4px' }}
                    >
                      {item.product && item.product.images && item.product.images.length > 0 ? (
                        <Image 
                          src={item.product.images[0].replace('/assets/images/', '/')} 
                          alt={item.name} 
                          width={80}
                          height={80}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                        />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted bg-light">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <span className="brand-text d-block mb-1 text-uppercase">SWEETTREE</span>
                      <h3 className="product-name m-0" style={{ fontSize: '14px', lineHeight: '1.4' }}>{item.name}</h3>
                      <div className="product-pricing mt-1">
                        <span className="current-price fs-6">₹{item.price}</span> <span className="text-muted fs-7">x {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <span className="current-price fs-5">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-3">Payment Details</h5>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Subtotal</span>
                <span className="fw-medium">₹{order.subtotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span>Discount</span>
                  <span className="fw-medium">-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-muted">Tax</span>
                <span className="fw-medium">₹{order.tax}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Shipping Fee</span>
                <span className="fw-medium">
                  {order.shippingFee === 0 ? <span className="text-success">Free</span> : `₹${order.shippingFee}`}
                </span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark fs-5">Total Paid</span>
                <span className="fw-bold text-dark fs-5">₹{order.totalAmount}</span>
              </div>
              <div className="mt-2 text-end">
                <span className="badge bg-success-subtle text-success fs-7 px-3 py-2 rounded-pill">
                  Payment Status: {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Cancel / Refund Action */}
          {(!['Cancelled', 'Refunded'].includes(order.orderStatus)) && hasRefundPermission && (
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 text-center mt-4">
              <h6 className="fw-bold mb-3">Need help with your order?</h6>
              {(['Placed', 'Confirmed', 'Packed'].includes(order.orderStatus)) ? (
                <button 
                  className="btn btn-outline-danger px-5"
                  onClick={() => setShowRefundModal('cancel')}
                >
                  Cancel Order
                </button>
              ) : order.orderStatus === 'Delivered' ? (
                <button 
                  className="btn btn-outline-warning px-5"
                  onClick={() => setShowRefundModal('refund')}
                >
                  Request Refund
                </button>
              ) : (
                <p className="text-muted small m-0">Your order is currently in transit. You can request a refund once it is delivered.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Order Status Timeline Progress */}
        <div className="col-lg-4">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-4 display-font text-dark border-bottom pb-2">Delivery Status</h4>
            
            {order.orderStatus === 'Cancelled' ? (
              <div className="text-center py-4">
                <div className="rounded-circle p-3 mb-2 bg-danger-subtle text-danger d-inline-block">
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold text-danger">Cancelled</h5>
                <p className="text-muted fs-7">This order has been cancelled and refunded.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4 relative-timeline py-2 ps-2">
                {steps.map((step, idx) => {
                  const status = getStepStatus(idx);
                  const getStepDate = (stepName) => {
                    if (stepName === 'Placed') return order.createdAt;
                    if (stepName === 'Confirmed') return order.confirmedAt;
                    if (stepName === 'Packed') return order.packedAt;
                    if (stepName === 'Shipped') return order.shippedAt;
                    if (stepName === 'Delivered') return order.deliveredAt;
                    return null;
                  };
                  const stepDate = getStepDate(step);

                  return (
                    <div key={step} className="d-flex align-items-start gap-3 w-100">
                      <div className="position-relative flex-shrink-0">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: status === 'completed' || status === 'active' ? 'var(--accent-color)' : '#e9ecef',
                            color: status === 'completed' || status === 'active' ? '#fff' : '#6c757d',
                            zIndex: 2,
                            position: 'relative'
                          }}
                        >
                          {status === 'completed' ? <Check size={16} /> : <Calendar size={14} />}
                        </div>
                        {idx < steps.length - 1 && (
                          <div 
                            className="position-absolute start-50 translate-middle-x"
                            style={{
                              width: '2px',
                              height: '42px',
                              backgroundColor: idx < currentStepIndex ? 'var(--accent-color)' : '#dee2e6',
                              top: '32px',
                              zIndex: 1
                            }}
                          ></div>
                        )}
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-1">
                          <h6 className={`fw-bold m-0 ${status === 'active' ? 'text-success' : status === 'pending' ? 'text-muted' : 'text-dark'}`}>{step}</h6>
                          {stepDate && (
                            <small className="text-muted ms-auto text-end" style={{ fontSize: '0.75rem' }}>
                              {new Date(stepDate).toLocaleDateString()} {new Date(stepDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          )}
                        </div>
                        <small className="text-muted fs-8">
                          {status === 'completed' ? 'Activity recorded' : status === 'active' ? 'Current processing stage' : 'Pending completion'}
                        </small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Delhivery Live Tracking */}
            {order.shipments && order.shipments.length > 0 && (
              <div className="mt-4 pt-4 border-top">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><Truck size={18} /> Live Carrier Tracking</h5>
                {trackingLoading ? (
                  <p className="text-muted fs-7">Fetching live status from couriers...</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {order.shipments.map(shipment => {
                      const tData = trackingData[shipment.waybill];
                      return (
                        <div key={shipment.waybill} className="bg-light p-3 rounded border">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <p className="m-0 fw-bold text-primary">{tData?.Status?.Status || shipment.status || 'Manifested'}</p>
                            {shipment.warehouse && (
                              <span className="badge bg-secondary">Part of order</span>
                            )}
                          </div>
                          <small className="text-muted d-block mb-3">
                            Waybill: <span className="font-monospace fw-bold">{shipment.waybill}</span> ({shipment.courierName})
                            {tData?.ExpectedDeliveryDate && (
                              <span className="d-block mt-1 text-success">
                                <Calendar size={12} className="me-1"/> Expected Delivery: {new Date(tData.ExpectedDeliveryDate).toLocaleDateString()}
                              </span>
                            )}
                          </small>
                          
                          {tData?.Scans && tData.Scans.length > 0 && (
                            <div className="tracking-scans" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                              {tData.Scans.map((scan, i) => (
                                <div key={i} className="mb-2 pb-2 border-bottom">
                                  <strong className="d-block fs-8 text-dark">{scan.ScanDetail.Instructions}</strong>
                                  <small className="text-muted" style={{fontSize: '11px'}}>
                                    {new Date(scan.ScanDetail.ScanDateTime).toLocaleString()} - {scan.ScanDetail.ScannedLocation}
                                  </small>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      )}

      {showRefundModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {showRefundModal === 'cancel' ? 'Cancel Order' : 'Request Refund'}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowRefundModal(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  Please provide a reason for {showRefundModal === 'cancel' ? 'cancelling' : 'refunding'} this order.
                </p>
                <textarea 
                  className="form-control shadow-none bg-light"
                  rows="4"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light rounded px-4" onClick={() => setShowRefundModal(null)}>Close</button>
                <button 
                  type="button" 
                  className={`btn ${showRefundModal === 'cancel' ? 'btn-danger' : 'btn-warning'} px-4 rounded`}
                  onClick={handleRefundSubmit}
                  disabled={refundSubmitting || !refundReason.trim()}
                >
                  {refundSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
