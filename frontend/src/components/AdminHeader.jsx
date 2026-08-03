"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { clearCart } from '../store/cartSlice';
import { Home, Bell, User, LogOut, ShoppingCart, RotateCcw, MessageSquare, Truck, CheckCircle, ChevronRight } from 'lucide-react';
import api from '../utils/axiosConfig';

const TYPE_CONFIG = {
  new_order:       { icon: <ShoppingCart size={15} />, color: '#3b82f6', bg: '#eff6ff' },
  order_shipped:   { icon: <Truck size={15} />,        color: '#f59e0b', bg: '#fffbeb' },
  order_delivered: { icon: <CheckCircle size={15} />,  color: '#10b981', bg: '#f0fdf4' },
  refund_request:  { icon: <RotateCcw size={15} />,    color: '#ef4444', bg: '#fef2f2' },
  new_enquiry:     { icon: <MessageSquare size={15} />,color: '#8b5cf6', bg: '#f5f3ff' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function AdminHeader() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showBell, setShowBell] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch notifications
  const fetchNotifs = async () => {
    try {
      const res = await api.get(`/notifications`);
      if (res.data.success) {
        const allNotifs = res.data.notifications;
        setNotifications(allNotifs.slice(0, 8));
        
        const stored = JSON.parse(localStorage.getItem('readAdminNotifs') || '[]');
        const unreadList = allNotifs.filter(n => !stored.includes(n.id));
        setUnread(unreadList.length);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isMounted) return;
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isMounted]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowBell(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCart());
    router.push('/');
  };

  const handleNotificationClick = (n) => {
    setShowBell(false);
    
    // Mark as read locally
    const stored = JSON.parse(localStorage.getItem('readAdminNotifs') || '[]');
    if (!stored.includes(n.id)) {
      stored.push(n.id);
      localStorage.setItem('readAdminNotifs', JSON.stringify(stored));
      setUnread(prev => Math.max(0, prev - 1));
    }
    
    let targetLink = n.link;
    if (targetLink && targetLink.includes('inventory-notifications')) {
      targetLink = '/admin/inventory';
    }
    router.push(targetLink);
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      position: 'sticky',
      top: 0,
      zIndex: 1030,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>

      {/* Home */}
      <Link href="/" title="Go to Store" aria-label="Go to Store"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', color: '#374151', textDecoration: 'none' }}
        className="admin-header-icon-btn"
      >
        <Home size={20} />
      </Link>

      {/* Bell Notification */}
      <div ref={bellRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowBell(!showBell); setShowProfile(false); fetchNotifs(); }}
          title="Notifications"
          aria-label="Notifications"
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'transparent', color: '#374151', cursor: 'pointer' }}
          className="admin-header-icon-btn"
        >
          <Bell size={20} />
          {isMounted && unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', color: '#fff',
              borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>

        {/* Bell Dropdown */}
        {showBell && (
          <div style={{
            position: 'absolute', right: 0, top: '48px', width: 360,
            backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 9999, overflow: 'hidden', border: '1px solid #f3f4f6'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
              {unread > 0 && <span style={{ fontSize: 12, backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>{unread} new</span>}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>No new notifications</div>
              ) : (
                notifications.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.new_order;
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                        cursor: 'pointer', borderBottom: i < notifications.length - 1 ? '1px solid #f9fafb' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: cfg.bg, color: cfg.color }}>
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</div>
                      </div>
                      <div style={{ flexShrink: 0, fontSize: 11, color: '#9ca3af' }}>{timeAgo(n.time)}</div>
                    </div>
                  );
                })
              )}
            </div>
            <div
              onClick={() => { setShowBell(false); router.push('/admin/notifications'); }}
              style={{ padding: '12px 16px', textAlign: 'center', borderTop: '1px solid #f3f4f6', cursor: 'pointer', color: '#374151', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View all notifications <ChevronRight size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setShowProfile(!showProfile); setShowBell(false); }}
          title="Profile"
          aria-label="Profile"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 24, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', color: '#374151' }}
          className="admin-header-icon-btn"
        >
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: '#162C18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#fff" />
          </div>
          {isMounted && user && <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>}
        </button>

        {/* Profile Dropdown */}
        {showProfile && (
          <div style={{
            position: 'absolute', right: 0, top: '52px', width: 200,
            backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 9999, overflow: 'hidden', border: '1px solid #f3f4f6'
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 14, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>

      <style>{`
        .admin-header-icon-btn:hover { background-color: #f3f4f6 !important; }
      `}</style>
    </header>
  );
}
