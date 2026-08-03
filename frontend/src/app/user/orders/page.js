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
    <div className="container py-5">
      <h1 className="fw-bold mb-4" style={{ color: '#203d74' }}>My Orders</h1>

      {orderLoading ? (
        <div className="d-flex flex-column gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-4 rounded-4 shadow-sm border" style={{ minHeight: '220px', opacity: 0.6 }}>
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <div className="bg-light rounded" style={{ width: '180px', height: '20px' }}></div>
                  <div className="bg-light rounded mt-2" style={{ width: '100px', height: '14px' }}></div>
                </div>
                <div className="bg-light rounded" style={{ width: '80px', height: '20px' }}></div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light rounded" style={{ width: '80px', height: '80px', flexShrink: 0 }}></div>
                <div className="flex-grow-1">
                  <div className="bg-light rounded" style={{ width: '120px', height: '14px', marginBottom: '8px' }}></div>
                  <div className="bg-light rounded" style={{ width: '200px', height: '16px', marginBottom: '8px' }}></div>
                  <div className="bg-light rounded" style={{ width: '70px', height: '18px' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 card border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
          <ShoppingBag size={48} className="text-muted mx-auto mb-3" />
          <h4 className="fw-bold mb-2">No Orders Placed Yet</h4>
          <p className="text-muted mb-4">You haven't placed any orders yet on our platform.</p>
          <Link href="/shop" className="btn btn-dark rounded-pill px-4 py-2">Browse Products</Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="d-flex flex-column gap-4">
              {orders.map((order) => (
                <Link 
                  key={order._id} 
                  href={`/user/orders/${order._id}`}
                  className="bg-white p-4 rounded-4 shadow-sm border text-decoration-none d-block hover-lift transition-all position-relative"
                >
                  <div className="d-flex flex-wrap justify-content-between align-items-start border-bottom pb-3 mb-4">
                    <div>
                      <h6 className="fw-bold m-0 text-dark mb-1 d-flex align-items-center gap-2">
                        Order #{order._id.substring(0, 8).toUpperCase()}
                        {getStatusBadge(order.orderStatus)}
                      </h6>
                      <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</small>
                    </div>
                    <div className="text-end mt-2 mt-md-0">
                      <span className="btn btn-outline-success btn-sm rounded-pill fw-bold d-inline-flex align-items-center gap-1">
                        View Details <Eye size={14} />
                      </span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-8">
                      <div className="d-flex flex-column gap-3">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={item._id || index} className="d-flex align-items-center gap-3">
                            <div 
                              className="product-img-box bg-light rounded-3 d-flex align-items-center justify-content-center" 
                              style={{ width: '60px', height: '60px', flexShrink: 0, overflow: 'hidden' }}
                            >
                              {item.product && item.product.images && item.product.images.length > 0 ? (
                                <Image 
                                  src={getImageUrl(item.product.images[0])} 
                                  alt={item.name} 
                                  width={60}
                                  height={60}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              ) : (
                                <ShoppingBag size={20} className="text-muted" />
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="text-dark fw-semibold mb-1 text-truncate" style={{ maxWidth: '250px' }}>{item.name}</h6>
                              <div className="text-muted small">
                                Qty: {item.quantity} × ₹{item.price}
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-muted small fw-medium mt-2">
                            + {order.items.length - 2} more item(s)
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-4 d-flex flex-column justify-content-end text-md-end mt-4 mt-md-0 border-start-md ps-md-4">
                      <span className="text-muted small mb-1">Total Amount</span>
                      <span className="fs-4 fw-bold text-dark">₹{order.totalAmount}</span>
                      {order.paymentStatus === 'Paid' ? (
                         <span className="text-success small fw-medium mt-1"><i className="fas fa-check-circle"></i> Payment Successful</span>
                      ) : order.paymentStatus === 'Refunded' ? (
                         <span className="text-primary small fw-medium mt-1"><i className="fas fa-undo"></i> Refunded</span>
                      ) : (
                         <span className="text-warning small fw-medium mt-1"><i className="fas fa-clock"></i> Cash on Delivery</span>
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
