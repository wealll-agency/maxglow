"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import { 
  LayoutDashboard, ShoppingBag, ClipboardList, ShoppingCart, 
  Users, Receipt, LogOut, Tag, ChevronLeft, ChevronRight, 
  RotateCcw, ChevronDown, ChevronUp, MessageSquare, MapPin, 
  Package, Shield, Image as ImageIcon 
} from 'lucide-react';
import api from '../utils/axiosConfig';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [counts, setCounts] = useState({ orders: 0, refunds: 0, enquiries: 0 });
  const [badges, setBadges] = useState({ orders: 0, refunds: 0, enquiries: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    setIsMounted(true);
    
    // Auto collapse on small screens after client hydration completes
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsCollapsed(true);
    }

    const fetchCounts = async () => {
      try {
        const res = await api.get('/notifications/badge-counts');
        if (res.data.success) {
          const { orders, refunds, enquiries } = res.data.counts;
          setCounts({ orders, refunds, enquiries });

          let lastSeenOrders = parseInt(localStorage.getItem('admin_seen_orders') || '0');
          let lastSeenRefunds = parseInt(localStorage.getItem('admin_seen_refunds') || '0');
          let lastSeenEnquiries = parseInt(localStorage.getItem('admin_seen_enquiries') || '0');

          if (orders < lastSeenOrders) { lastSeenOrders = orders; localStorage.setItem('admin_seen_orders', orders); }
          if (refunds < lastSeenRefunds) { lastSeenRefunds = refunds; localStorage.setItem('admin_seen_refunds', refunds); }
          if (enquiries < lastSeenEnquiries) { lastSeenEnquiries = enquiries; localStorage.setItem('admin_seen_enquiries', enquiries); }

          setBadges({
            orders: orders - lastSeenOrders,
            refunds: refunds - lastSeenRefunds,
            enquiries: enquiries - lastSeenEnquiries
          });
        }
      } catch {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
    router.push('/');
  };

  const handleNavClick = (id) => {
    if (!id) return;
    if (id === 'orders') {
      localStorage.setItem('admin_seen_orders', counts.orders);
      setBadges(prev => ({ ...prev, orders: 0 }));
    } else if (id === 'refunds') {
      localStorage.setItem('admin_seen_refunds', counts.refunds);
      setBadges(prev => ({ ...prev, refunds: 0 }));
    } else if (id === 'enquiries') {
      localStorage.setItem('admin_seen_enquiries', counts.enquiries);
      setBadges(prev => ({ ...prev, enquiries: 0 }));
    }
  };

  // Sidebar link definitions
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Media Manager', path: '/admin/media', icon: <ImageIcon size={20} /> },
    { label: 'Product Manager', path: '/admin/products', icon: <ShoppingBag size={20} /> },
    { label: 'Homepage Products', path: '/admin/homepage-products', icon: <LayoutDashboard size={20} /> },
    { label: 'Warehouses', path: '/admin/warehouses', icon: <MapPin size={20} /> },
    { label: 'Inventory Manager', path: '/admin/inventory', icon: <ClipboardList size={20} /> },
    { label: 'Orders Queue', path: '/admin/orders', icon: <ShoppingCart size={20} />, id: 'orders', badge: badges.orders },
    { label: 'Shipments', path: '/admin/shipments', icon: <Package size={20} /> },
    { 
      label: 'Refund Requests', 
      icon: <RotateCcw size={20} />, 
      isSubmenu: true,
      badge: badges.refunds,
      id: 'refunds',
      subItems: [
        { label: 'Pending', path: '/admin/refunds/pending' },
        { label: 'Approved', path: '/admin/refunds/approved' },
        { label: 'Refunded', path: '/admin/refunds/refunded' },
        { label: 'Rejected', path: '/admin/refunds/rejected' }
      ]
    },
    { label: 'Customer Profiling', path: '/admin/customers', icon: <Users size={20} /> },
    { label: 'Customer Access', path: '/admin/access', icon: <Shield size={20} /> },
    { label: 'Enquiries', path: '/admin/enquiries', icon: <MessageSquare size={20} />, id: 'enquiries', badge: badges.enquiries },
    { label: 'Reports Center', path: '/admin/reports', icon: <Receipt size={20} /> },
    { label: 'Coupon Manager', path: '/admin/coupons', icon: <Tag size={20} /> }
  ];

  const sidebarWidth = isCollapsed ? '80px' : '300px';

  return (
    <aside 
      className="sidebar d-flex flex-column py-4" 
      style={{ 
        height: '100vh',
        position: 'sticky',
        top: 0,
        width: sidebarWidth, 
        minWidth: sidebarWidth, 
        flexShrink: 0, 
        backgroundColor: '#162C18', 
        color: '#FAF9F6',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        zIndex: 1040
      }}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label="Toggle Sidebar"
        title="Toggle Sidebar"
        className="btn btn-sm position-absolute rounded-circle shadow p-1 d-flex align-items-center justify-content-center"
        style={{ 
          right: '-15px', 
          top: '25px', 
          zIndex: 1050, 
          width: '30px', 
          height: '30px', 
          backgroundColor: '#FFFFFF', 
          border: '1px solid #162C18',
          color: '#162C18'
        }}
      >
        {isCollapsed ? <ChevronRight size={18} color="#162C18" /> : <ChevronLeft size={18} color="#162C18" />}
      </button>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', scrollbarWidth: 'none' }}>
        <div>
          {/* Logo / Brand Header */}
          <div className="px-4 mb-4 d-flex align-items-center justify-content-between">
            {!isCollapsed ? (
              <div className="d-flex align-items-center gap-2">
                <Link href="/" className="d-flex align-items-center text-decoration-none">
                  <img 
                    src="/logo.png" 
                    alt="MaxGlow Logo"
                    style={{ height: '38px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                  />
                </Link>
                <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 px-2 py-0.5 fs-9 fw-bold">
                  SUPER ADMIN
                </span>
              </div>
            ) : (
              <Link href="/" className="mx-auto d-flex align-items-center text-decoration-none">
                <img 
                  src="/icon.png" 
                  alt="MaxGlow Logo"
                  style={{ height: '32px', width: '32px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                />
              </Link>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-3 d-flex flex-column gap-1">
            {navItems.map((item) => {
              if (item.isSubmenu) {
                const isSubmenuActive = item.subItems.some(sub => pathname === sub.path);
                return (
                  <div key={item.label} className="w-100">
                    <button
                      onClick={() => {
                        !isCollapsed && setIsRefundOpen(!isRefundOpen);
                        handleNavClick(item.id);
                      }}
                      className={`sidebar-nav-link w-100 border-0 ${isSubmenuActive ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        color: isSubmenuActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.75)',
                        backgroundColor: isSubmenuActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.92rem',
                        fontWeight: isSubmenuActive ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <span className="d-flex align-items-center">{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="d-flex align-items-center gap-2">
                          {item.badge > 0 && (
                            <span className="badge bg-danger rounded-pill px-2 py-0.5 fs-8 fw-bold">
                              {item.badge}
                            </span>
                          )}
                          {isRefundOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </button>

                    {/* Submenu links */}
                    {!isCollapsed && (
                      <div 
                        className="d-flex flex-column gap-1 ms-4 ps-2 border-start border-white border-opacity-25"
                        style={{
                          maxHeight: isRefundOpen ? '300px' : '0px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease-in-out',
                          opacity: isRefundOpen ? 1 : 0,
                          marginTop: isRefundOpen ? '4px' : '0px',
                          visibility: isRefundOpen ? 'visible' : 'hidden'
                        }}
                      >
                        {item.subItems.map(subItem => {
                          const isActive = pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.label}
                              href={subItem.path}
                              prefetch={true}
                              onMouseEnter={() => router.prefetch(subItem.path)}
                              className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                color: isActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.65)',
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                textDecoration: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span className="me-2" style={{ fontSize: '10px' }}>•</span>
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.path)}
                  onClick={() => handleNavClick(item.id)}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    color: isActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.75)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    textDecoration: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex align-items-center">{item.icon}</span>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge > 0 && (
                    <span className="badge bg-danger rounded-pill px-2 py-0.5 fs-8 fw-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="px-3 pt-3 border-top border-white border-opacity-10 mt-3">
          <button
            onClick={handleLogout}
            className="btn w-100 border-0 text-start text-white-50 hover-text-white d-flex align-items-center gap-3 p-2 rounded-3"
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              backgroundColor: 'transparent',
              transition: 'background 0.2s ease'
            }}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut size={20} className="text-danger opacity-75" />
            {!isCollapsed && <span className="fs-8 fw-medium text-white">Sign Out</span>}
          </button>
          {!isCollapsed && (
            <div className="text-center mt-3" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
              v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
