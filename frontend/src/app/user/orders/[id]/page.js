"use client";
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, trackDelhiveryShipment, createRefundRequest } from '../../../../store/ordersSlice';
import { clearCart } from '../../../../store/cartSlice';
import { ShieldCheck, MapPin, Truck, Check, Calendar, ArrowLeft, ShoppingBag, CheckCircle2, Clock, Package, ChevronDown } from 'lucide-react';
import { useNotification } from '../../../../context/NotificationContext';

const getStatusBadge = (status) => {
  const badgeStyle = "d-inline-flex align-items-center gap-1 px-2.5 py-1.5 rounded-pill text-nowrap fw-semibold";
  switch (status) {
    case 'Delivered':
      return <span className={`badge bg-success bg-opacity-10 text-success ${badgeStyle}`}><CheckCircle2 size={14} /> Delivered</span>;
    case 'Cancelled':
      return <span className={`badge bg-danger bg-opacity-10 text-danger ${badgeStyle}`}><Clock size={14} /> Cancelled</span>;
    case 'Shipped':
      return <span className={`badge bg-primary bg-opacity-10 text-primary ${badgeStyle}`}><Truck size={14} /> Shipped</span>;
    case 'Packed':
      return <span className={`badge bg-info bg-opacity-10 text-info ${badgeStyle}`}><Package size={14} /> Packed</span>;
    default:
      return <span className={`badge bg-warning bg-opacity-10 text-warning ${badgeStyle}`}><Clock size={14} /> {status || 'Pending'}</span>;
  }
};

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
  const [isDeliveryStatusOpen, setIsDeliveryStatusOpen] = useState(false);
  
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

  const renderDeliveryTimeline = () => (
    <>
      {order.orderStatus === 'Cancelled' ? (
        <div className="text-center py-4">
          <div className="rounded-circle p-3 mb-3 bg-danger-subtle text-danger d-inline-block">
            <ShieldCheck size={36} />
          </div>
          <h5 className="fw-bold text-danger mb-2">Order Cancelled</h5>
          <p className="text-muted fs-7 mb-0">This order has been cancelled and refunded.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4 relative-timeline py-2">
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
              <div key={step} className="d-flex align-items-start gap-3 w-100 position-relative">
                <div className="position-relative flex-shrink-0">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: status === 'completed' ? '#198754' : status === 'active' ? '#0d6efd' : '#f8f9fa',
                      color: status === 'completed' || status === 'active' ? '#fff' : '#adb5bd',
                      border: status === 'pending' ? '2px solid #e9ecef' : 'none',
                      zIndex: 2,
                      position: 'relative'
                    }}
                  >
                    {status === 'completed' ? <Check size={18} /> : <Calendar size={16} />}
                  </div>
                  {idx < steps.length - 1 && (
                    <div 
                      className="position-absolute start-50 translate-middle-x"
                      style={{
                        width: '2px',
                        height: '100%',
                        backgroundColor: idx < currentStepIndex ? '#198754' : '#e9ecef',
                        top: '36px',
                        zIndex: 1,
                        minHeight: '40px'
                      }}
                    ></div>
                  )}
                </div>
                
                <div className="flex-grow-1 pb-4">
                  <div className="d-flex flex-column gap-1">
                    <h6 className={`fw-bold m-0 ${status === 'completed' ? 'text-success' : status === 'active' ? 'text-primary' : 'text-muted'}`}>{step}</h6>
                    {stepDate ? (
                      <small className="text-muted fw-medium" style={{ fontSize: '0.75rem' }}>
                        {new Date(stepDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </small>
                    ) : (
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {status === 'active' ? 'Processing...' : 'Pending'}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delhivery Live Tracking */}
      {order.shipments && order.shipments.length > 0 && (
        <div className="mt-2 pt-4 border-top">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark"><Truck size={18} className="text-primary" /> Live Carrier Tracking</h6>
          {trackingLoading ? (
            <p className="text-muted fs-7">Fetching live status from couriers...</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {order.shipments.map(shipment => {
                const tData = trackingData[shipment.waybill];
                return (
                  <div key={shipment.waybill} className="bg-light p-3 rounded-4 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary rounded-pill px-3 py-2 fw-medium">{tData?.Status?.Status || shipment.status || 'Manifested'}</span>
                    </div>
                    <small className="text-dark d-block mb-3 fw-medium">
                      Waybill: <span className="font-monospace fw-bold text-primary">{shipment.waybill}</span>
                      <br/><span className="text-muted">Courier: {shipment.courierName}</span>
                      {tData?.ExpectedDeliveryDate && (
                        <span className="d-block mt-2 text-success fw-bold bg-success-subtle p-2 rounded">
                          <Calendar size={14} className="me-1 mb-1"/> Expected Delivery: {new Date(tData.ExpectedDeliveryDate).toLocaleDateString()}
                        </span>
                      )}
                    </small>
                    
                    {tData?.Scans && tData.Scans.length > 0 && (
                      <div className="tracking-scans bg-white p-3 rounded border shadow-sm" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {tData.Scans.map((scan, i) => (
                          <div key={i} className={`mb-3 pb-3 ${i !== tData.Scans.length - 1 ? 'border-bottom' : 'mb-0 pb-0'}`}>
                            <strong className="d-block fs-8 text-dark mb-1">{scan.ScanDetail.Instructions}</strong>
                            <small className="text-muted fw-medium d-flex align-items-center gap-1" style={{fontSize: '11px'}}>
                              <Clock size={10} />
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
    </>
  );

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
        <Link href="/user/orders" className="text-decoration-none text-muted hover-green d-inline-flex align-items-center gap-1 fw-medium">
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>

      {/* Mobile Version: Delivery Status Collapsible Accordion (First Section on Page) */}
      {order && (
        <div className="d-block d-lg-none mb-4">
          <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
            <div
              onClick={() => setIsDeliveryStatusOpen(!isDeliveryStatusOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                userSelect: 'none',
                background: isDeliveryStatusOpen ? '#F7FBFD' : 'white',
                transition: 'background 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h6 className="fw-bold m-0 text-dark" style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px' }}>
                  Delivery Status
                </h6>
                {getStatusBadge(order.orderStatus)}
              </div>

              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isDeliveryStatusOpen ? '#EAF8FF' : '#f8fafc',
                display: 'flex', alignItems: 'center', justifyCenter: 'center',
                transition: 'all 0.3s ease'
              }}>
                <ChevronDown 
                  size={18} 
                  style={{ 
                    color: isDeliveryStatusOpen ? '#4A90E2' : '#64748b', 
                    transition: 'transform 0.3s ease',
                    transform: isDeliveryStatusOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </div>
            </div>

            {isDeliveryStatusOpen && (
              <div style={{ padding: '16px 20px 20px 20px', borderTop: '1px dashed #e2e8f0', background: 'white' }}>
                {renderDeliveryTimeline()}
              </div>
            )}
          </div>
        </div>
      )}

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
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 border-bottom pb-3 mb-4">
              <div>
                <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2 mb-2">
                  Order #{order._id.substring(0, 8).toUpperCase()}
                  {getStatusBadge(order.orderStatus)}
                </h5>
                <small className="text-muted fw-medium">Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</small>
              </div>
              <div className="d-flex flex-column align-items-sm-end mt-2 mt-sm-0">
                <span className="fs-3 fw-bold text-dark">₹{order.totalAmount}</span>
                {order.paymentStatus === 'Paid' ? (
                   <span className="text-success small fw-bold mt-1"><i className="fas fa-check-circle"></i> Payment Successful</span>
                ) : order.paymentStatus === 'Refunded' ? (
                   <span className="text-primary small fw-bold mt-1"><i className="fas fa-undo"></i> Refunded</span>
                ) : (
                   <span className="text-warning small fw-bold mt-1"><i className="fas fa-clock"></i> Cash on Delivery</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="d-flex align-items-start gap-3 mb-4 bg-light p-3 rounded-4 border">
              <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                <MapPin size={22} />
              </div>
              <div>
                <h6 className="fw-bold m-0 mb-1 text-dark">Shipping Destination</h6>
                <p className="m-0 text-dark fs-7 lh-sm">{order.deliveryAddress.street || order.deliveryAddress.address || order.deliveryAddress.locality}, {order.deliveryAddress.city}</p>
                <p className="m-0 text-muted fs-7 mt-1">{order.deliveryAddress.state} - {order.deliveryAddress.zipCode || order.deliveryAddress.pincode}, {order.deliveryAddress.country || 'India'}</p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="d-flex align-items-start gap-3 bg-primary bg-opacity-10 p-3 rounded-4 border border-primary-subtle">
                <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '45px', height: '45px' }}>
                  <Truck size={22} />
                </div>
                <div>
                  <h6 className="fw-bold m-0 mb-1 text-primary">Tracking Reference</h6>
                  <p className="m-0 text-dark fw-bold font-monospace fs-6">{order.trackingNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Items Recap */}
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark"><ShoppingBag size={20} className="text-primary"/> Purchased Items</h5>
            
            <div className="d-flex flex-column gap-3">
              {order.items.map((item, index) => (
                <div key={item._id || index} className="d-flex align-items-center justify-content-between pb-3 border-bottom last-border-0">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="product-img-box bg-light rounded-3 d-flex align-items-center justify-content-center" 
                      style={{ width: '70px', height: '70px', flexShrink: 0, overflow: 'hidden' }}
                    >
                      {item.product && item.product.images && item.product.images.length > 0 ? (
                        <Image 
                          src={item.product.images[0].replace('/assets/images/', '/')} 
                          alt={item.name} 
                          width={70}
                          height={70}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <ShoppingBag size={24} className="text-muted" />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-dark fw-bold mb-1 lh-sm" style={{ maxWidth: '300px' }}>{item.name}</h6>
                      <div className="text-muted small fw-medium">
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                  </div>
                  <span className="fw-bold text-dark fs-5 text-end">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
            <h5 className="fw-bold mb-4 text-dark">Payment Summary</h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between">
                <span className="text-muted fw-medium">Subtotal</span>
                <span className="fw-bold text-dark">₹{order.subtotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <span className="fw-medium">Discount</span>
                  <span className="fw-bold">-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <span className="text-muted fw-medium">Tax</span>
                <span className="fw-bold text-dark">₹{order.tax}</span>
              </div>
              <div className="d-flex justify-content-between border-bottom pb-3">
                <span className="text-muted fw-medium">Shipping Fee</span>
                <span className="fw-bold">
                  {order.shippingFee === 0 ? <span className="text-success">Free</span> : `₹${order.shippingFee}`}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-1">
                <span className="fw-bold text-dark fs-5">Total Paid</span>
                <span className="fw-bold text-primary fs-4">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Cancel / Refund Action */}
          {(!['Cancelled', 'Refunded'].includes(order.orderStatus)) && hasRefundPermission && (
            <div className="bg-white p-4 rounded-4 shadow-sm border mb-4 text-center">
              <h6 className="fw-bold mb-3 text-dark">Need help with your order?</h6>
              {(['Placed', 'Confirmed'].includes(order.orderStatus)) ? (
                <button 
                  className="btn btn-outline-danger px-5 rounded-pill fw-bold"
                  onClick={() => setShowRefundModal('cancel')}
                >
                  Cancel Order
                </button>
              ) : order.orderStatus === 'Delivered' ? (
                <button 
                  className="btn btn-outline-warning px-5 rounded-pill fw-bold"
                  onClick={() => setShowRefundModal('refund')}
                >
                  Request Refund
                </button>
              ) : (
                <p className="text-muted small m-0 fw-medium">
                  {order.orderStatus === 'Packed' 
                    ? 'Your order is already packed and cannot be cancelled. You can request a refund once it is delivered.' 
                    : 'Your order is currently in transit. You can request a refund once it is delivered.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Order Status Timeline Progress (Desktop only) */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="bg-white p-4 rounded-4 shadow-sm border sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Delivery Status</h5>
            {renderDeliveryTimeline()}
          </div>
        </div>
      </div>
      )}

      {showRefundModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  {showRefundModal === 'cancel' ? 'Cancel Order' : 'Request Refund'}
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowRefundModal(null)}></button>
              </div>
              <div className="modal-body px-4 py-3">
                <p className="text-muted mb-3 fw-medium">
                  Please provide a reason for {showRefundModal === 'cancel' ? 'cancelling' : 'refunding'} this order.
                </p>
                <textarea 
                  className="form-control shadow-none bg-light border-0 p-3 rounded-3"
                  rows="4"
                  placeholder="Type your reason here..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
                <button type="button" className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setShowRefundModal(null)}>Close</button>
                <button 
                  type="button" 
                  className={`btn ${showRefundModal === 'cancel' ? 'btn-danger' : 'btn-warning'} px-4 rounded-pill fw-bold`}
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
