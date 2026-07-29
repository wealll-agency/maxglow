"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import { LayoutDashboard, ShoppingBag, ClipboardList, ShoppingCart, Users, Receipt, LogOut, Tag, ChevronLeft, ChevronRight, RotateCcw, ChevronDown, ChevronUp, MessageSquare, MapPin, Package, Shield, Image as ImageIcon } from 'lucide-react';
import api from '../utils/axiosConfig';

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [unreadEnquiries, setUnreadEnquiries] = useState(0);
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  // Poll for new enquiries and refund requests every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get(`/enquiries`);
        if (res.data.success) setUnreadEnquiries(res.data.unreadCount);
      } catch {}
    };

    const fetchPendingRefunds = async () => {
      try {
        const res = await api.get(`/refunds?status=Pending`);
        if (res.data.success) setPendingRefunds(res.data.refunds.length);
      } catch {}
    };

    fetchUnread();
    fetchPendingRefunds();
    const interval = setInterval(() => {
      fetchUnread();
      fetchPendingRefunds();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
    router.push('/');
  };

  if (!user) return null;

  // Sidebar link definitions
  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Media Manager', path: '/admin/media', icon: <ImageIcon size={20} /> },
    { label: 'Product Manager', path: '/admin/products', icon: <ShoppingBag size={20} /> },
    { label: 'Homepage Products', path: '/admin/homepage-products', icon: <LayoutDashboard size={20} /> },
    { label: 'Warehouses', path: '/admin/warehouses', icon: <MapPin size={20} /> },
    { label: 'Inventory Manager', path: '/admin/inventory', icon: <ClipboardList size={20} /> },
    { label: 'Orders Queue', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { label: 'Shipments', path: '/admin/shipments', icon: <Package size={20} /> },
    { 
      label: 'Refund Requests', 
      icon: <RotateCcw size={20} />, 
      isSubmenu: true,
      badge: pendingRefunds,
      subItems: [
        { label: 'Pending', path: '/admin/refunds/pending' },
        { label: 'Approved', path: '/admin/refunds/approved' },
        { label: 'Refunded', path: '/admin/refunds/refunded' },
        { label: 'Rejected', path: '/admin/refunds/rejected' }
      ]
    },
    { label: 'Customer Profiling', path: '/admin/customers', icon: <Users size={20} /> },
    { label: 'Customer Access', path: '/admin/access', icon: <Shield size={20} /> },
    { label: 'Enquiries', path: '/admin/enquiries', icon: <MessageSquare size={20} />, badge: unreadEnquiries },
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
          {/* Brand label */}
          <div className={`px-3 mb-5 ${isCollapsed ? 'text-center' : 'px-4'}`} style={{ display: 'flex', flexDirection: 'column', alignItems: isCollapsed ? 'center' : 'flex-start' }}>
            {!isCollapsed ? (
              <>
                <div style={{ height: '36px' }}>
                  <img
                    src="/logo.png"
                    alt="MaxGlow"
                    style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-20 mt-2 fs-8">
                  {user.role} System
                </div>
              </>
            ) : (
              <span className="fs-3 fw-bold display-font text-white" style={{ fontFamily: 'var(--font-outfit)', letterSpacing: '-0.05em' }}>MG</span>
            )}
          </div>

          {/* Navigation list */}
          <nav className="d-flex flex-column gap-2 px-3">
            {navItems.map((item) => {
              // Role enforcement rules
              const isManagerOnly = ['Inventory Manager', 'Reports Center', 'Coupon Manager'].includes(item.label) && user.role === 'Staff';
              const isProductCrud = item.label === 'Product Manager' && user.role === 'Staff';
              if (isManagerOnly || isProductCrud) return null;

              if (item.isSubmenu) {
                const isSubActive = item.subItems.some(sub => pathname.startsWith(sub.path));
                return (
                  <div key={item.label} className="d-flex flex-column">
                    <div
                      onClick={() => {
                        if (!isCollapsed) setIsRefundOpen(!isRefundOpen);
                      }}
                      className={`sidebar-nav-link ${isSubActive && !isRefundOpen ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isSubActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.75)',
                        backgroundColor: isSubActive && !isRefundOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        padding: isCollapsed ? '12px' : '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%' }}>
                        {item.icon}
                        {!isCollapsed && <span>{item.label}</span>}
                        {!isCollapsed && item.badge > 0 && (
                          <span className="badge bg-danger ms-2 rounded-pill" style={{ fontSize: '11px' }}>{item.badge}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="d-flex align-items-center gap-1">
                          {isRefundOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </div>
                    
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

              const isActive = pathname.startsWith(item.path);
              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: isActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.75)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    textDecoration: 'none',
                    padding: isCollapsed ? '12px' : '12px 20px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.icon}
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && item.badge > 0 && (
                    <span className="badge bg-danger ms-auto rounded-pill" style={{ fontSize: '11px' }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile logout */}
        <div className={`px-3 border-top pt-4 mt-4 border-white border-opacity-10 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && (
            <div className="px-3 mb-3">
              <h6 className="m-0 fw-bold text-white fs-7 text-truncate">{user.name}</h6>
              <small className="text-white text-opacity-50 fs-8">{user.email}</small>
            </div>
          )}
          <button 
            onClick={handleLogout}
            aria-label="Sign Out"
            className={`w-100 sidebar-nav-link text-danger border-0 bg-transparent d-flex align-items-center gap-2 hover-light-red ${isCollapsed ? 'justify-content-center p-2' : 'text-start'}`}
            style={{ textDecoration: 'none', padding: isCollapsed ? '12px' : '12px 20px' }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
