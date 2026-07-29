"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import Image from 'next/image';


import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '@/store/ordersSlice';


import { ShoppingBag, Eye } from 'lucide-react';

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
        <div className="text-center py-5 card border-0 shadow-sm max-w-lg mx-auto">
          <i className="fas fa-shopping-bag fa-3x text-muted mb-3 mx-auto d-block"></i>
          <h4 className="fw-bold mb-2">No Orders Placed Yet</h4>
          <p className="text-muted mb-4">You have not placed any orders yet on our platform.</p>
          <Link href="/shop" className="btn btn-dark">Browse Products</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <Link 
              key={order._id} 
              href={`/user/orders/${order._id}`}
              className="bg-white p-4 rounded-4 shadow-sm border text-decoration-none d-block hover-lift transition-all"
            >
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div>
                  <h6 className="fw-bold m-0 text-dark">Order ID: #{order._id.substring(0, 10).toUpperCase()}</h6>
                  <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="text-end">
                  <span className="text-success fw-bold d-flex align-items-center gap-1">
                    View Details <Eye size={16} />
                  </span>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                {order.items.map((item, index) => (
                  <div key={item._id || index} className="d-flex align-items-center gap-3">
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
                          <i className="fas fa-shopping-bag"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <span className="brand-text d-block mb-1 text-uppercase">MAXGLOW</span>
                      <h3 className="product-name m-0" style={{ fontSize: '14px', lineHeight: '1.4' }}>{item.name}</h3>
                      <div className="product-pricing mt-1">
                        <span className="current-price fs-6">₹{item.price}</span> <span className="text-muted fs-7">x {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block" style={{ fontSize: '12px' }}>Total Paid</small>
                  <span className="current-price fs-5">₹{order.totalAmount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
