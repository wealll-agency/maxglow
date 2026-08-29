"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import Image from 'next/image';
import { getImageUrl } from '../../../utils/imageConfig';



import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../../store/ordersSlice';


import { ShoppingBag, Eye, Package, Truck, CheckCircle2, Clock } from 'lucide-react';

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

export default function OrderHistoryPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { list: orders, orderLoading } = useSelector((state) => state.orders);
  const { user, loading: authLoading } = useSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    if (!user) {
      router.push('/login?redirect=user/orders');
    }
  }, [user, authLoading, mounted, router]);

  useEffect(() => {
    if (user && !authLoading) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, user, authLoading]);

  if (!mounted || authLoading || !user) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 px-md-5 py-4" style={{ minHeight: '80vh' }}>
      {/* Title block with brand gradient underline */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'var(--font-outfit), sans-serif',
          fontSize: '24px',
          fontWeight: '800',
          color: '#1a2332',
          margin: 0,
        }}>
          My Orders
        </h2>
        <div style={{ height: '3px', width: '50px', background: 'linear-gradient(90deg, #4A90E2, #3BAE56)', borderRadius: '9999px', marginTop: '6px' }} />
      </div>

      {orderLoading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2].map((i) => (
            <div key={i} style={{ minHeight: '160px', opacity: 0.6, borderRadius: '12px', padding: '16px 20px', background: 'white', border: '1.5px solid #EAF8FF', boxShadow: '0 8px 30px rgba(74, 144, 226, 0.03)' }}>
              <div className="d-flex justify-content-between align-items-center pb-2 mb-2" style={{ borderBottom: '1px dashed #e2e8f0' }}>
                <div>
                  <div className="bg-light rounded" style={{ width: '140px', height: '16px' }}></div>
                  <div className="bg-light rounded mt-15" style={{ width: '80px', height: '12px' }}></div>
                </div>
                <div className="bg-light rounded" style={{ width: '60px', height: '16px' }}></div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light rounded" style={{ width: '44px', height: '44px', flexShrink: 0 }}></div>
                <div className="flex-grow-1">
                  <div className="bg-light rounded" style={{ width: '100px', height: '12px', marginBottom: '6px' }}></div>
                  <div className="bg-light rounded" style={{ width: '150px', height: '14px', marginBottom: '6px' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 card border-0 mx-auto" style={{ maxWidth: '400px', borderRadius: '16px', background: 'white', border: '1.5px solid #EAF8FF', boxShadow: '0 8px 30px rgba(74, 144, 226, 0.06)', padding: '30px' }}>
          <ShoppingBag size={40} color="#3BAE56" className="mx-auto mb-3" />
          <h5 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: '800', color: '#1a2332', marginBottom: '6px' }}>No Orders Placed Yet</h5>
          <p className="text-muted mb-3 fs-8">You haven't placed any orders yet on our platform.</p>
          <Link href="/shop" className="btn-mg-green px-3 py-1.5" style={{ display: 'inline-flex', margin: '0 auto', fontSize: '13px', padding: '10px 24px' }}>Browse Products</Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column gap-3">
              {orders.map((order) => (
                <Link 
                  key={order._id} 
                  href={`/user/orders/${order._id}`}
                  className="text-decoration-none d-block transition-all position-relative"
                  style={{
                    borderRadius: '12px',
                    padding: '16px 20px',
                    background: 'white',
                    border: '1.5px solid #EAF8FF',
                    boxShadow: '0 8px 30px rgba(74, 144, 226, 0.03)',
                    marginBottom: '12px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(74, 144, 226, 0.08)';
                    e.currentTarget.style.borderColor = '#DDF4FF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(74, 144, 226, 0.03)';
                    e.currentTarget.style.borderColor = '#EAF8FF';
                  }}
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-center pb-2 mb-3" style={{ borderBottom: '1px dashed #e2e8f0' }}>
                    <div>
                      <h6 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: '700', margin: 0, color: '#1a2332', fontSize: '14px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        Order #{order._id.substring(0, 8).toUpperCase()}
                        {getStatusBadge(order.orderStatus)}
                      </h6>
                      <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
                    </div>
                    <div className="text-end mt-1 mt-md-0">
                      <span 
                        className="fw-bold d-inline-flex align-items-center gap-1"
                        style={{
                          padding: '4px 12px',
                          border: '1px solid #3BAE56',
                          color: '#3BAE56',
                          fontSize: '11px',
                          borderRadius: '9999px',
                          background: 'transparent',
                        }}
                      >
                        View Details <Eye size={12} />
                      </span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="d-flex flex-column gap-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={item._id || index} className="d-flex align-items-center gap-3">
                            <div 
                              className="product-img-box bg-light d-flex align-items-center justify-content-center" 
                              style={{ width: '44px', height: '44px', flexShrink: 0, overflow: 'hidden', border: '1px solid #EAF8FF', borderRadius: '8px' }}
                            >
                              {item.product && item.product.images && item.product.images.length > 0 ? (
                                <Image 
                                  src={getImageUrl(item.product.images[0])} 
                                  alt={item.name} 
                                  width={44}
                                  height={44}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                />
                              ) : (
                                <ShoppingBag size={16} className="text-muted" />
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <h6 style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#1a2332', fontWeight: '600', margin: '0 0 2px', fontSize: '13px' }} className="text-truncate">{item.name}</h6>
                              <div className="text-muted" style={{ fontSize: '11px' }}>
                                Qty: {item.quantity} × ₹{item.price}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-muted small fw-medium mt-1" style={{ fontSize: '11px' }}>
                            + {order.items.length - 2} more item(s)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-4 d-flex flex-column justify-content-end text-md-end mt-3 mt-md-0 border-start-md ps-md-4" style={{ borderLeft: '1px dashed #e2e8f0' }}>
                      <span className="text-muted small mb-1" style={{ fontSize: '11px' }}>Total Amount</span>
                      <span style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>₹{order.totalAmount}</span>
                      {order.paymentStatus === 'Paid' ? (
                         <span className="text-success small fw-semibold mt-1" style={{ fontSize: '11px' }}><i className="fas fa-check-circle"></i> Payment Successful</span>
                      ) : order.paymentStatus === 'Refunded' ? (
                         <span className="text-primary small fw-semibold mt-1" style={{ fontSize: '11px' }}><i className="fas fa-undo"></i> Refunded</span>
                      ) : (
                         <span className="text-warning small fw-semibold mt-1" style={{ fontSize: '11px' }}><i className="fas fa-clock"></i> Cash on Delivery</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
