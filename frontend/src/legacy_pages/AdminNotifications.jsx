"use client";
import { useRouter } from 'next/navigation';



import { useEffect, useCallback, useState } from 'react';

import { ShoppingCart, RotateCcw, MessageSquare, Truck, CheckCircle, Bell, RefreshCw } from 'lucide-react';

import api from '@/utils/axiosConfig';

const TYPE_CONFIG = {
  new_order:       { icon: <ShoppingCart size={18} />, color: '#3b82f6', bg: '#eff6ff', label: 'New Order' },
  order_shipped:   { icon: <Truck size={18} />,        color: '#f59e0b', bg: '#fffbeb', label: 'Shipped' },
  order_delivered: { icon: <CheckCircle size={18} />,  color: '#10b981', bg: '#f0fdf4', label: 'Delivered' },
  refund_request:  { icon: <RotateCcw size={18} />,    color: '#ef4444', bg: '#fef2f2', label: 'Refund Request' },
  new_enquiry:     { icon: <MessageSquare size={18} />,color: '#8b5cf6', bg: '#f5f3ff', label: 'Enquiry' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications`);
      if (res.data.success) {
        const stored = JSON.parse(localStorage.getItem('readAdminNotifs') || '[]');
        const notifs = res.data.notifications.map(n => ({
          ...n,
          isRead: stored.includes(n.id)
        }));
        setNotifications(notifs);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleNotificationClick = (n) => {
    const stored = JSON.parse(localStorage.getItem('readAdminNotifs') || '[]');
    if (!stored.includes(n.id)) {
      stored.push(n.id);
      localStorage.setItem('readAdminNotifs', JSON.stringify(stored));
    }
    router.push(n.link);
  };

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Bell size={28} /> All Notifications
          </h2>
          <p className="text-muted mb-0">Activity from the last 7 days</p>
        </div>
        <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={fetchNotifications}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {/* Notification List */}
      <div className="card border-0 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={48} className="mb-3 opacity-25" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notif, i) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.new_order;
              return (
                <div
                  key={notif.id}
                  className={`list-group-item list-group-item-action border-0 py-3 px-4 ${notif.isRead ? '' : 'bg-light'}`}
                  style={{ cursor: 'pointer', borderBottom: i < notifications.length - 1 ? '1px solid #f3f4f6' : 'none' }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="d-flex align-items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 42, height: 42, backgroundColor: config.bg, color: config.color }}>
                      {config.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className={`fw-semibold ${notif.isRead ? 'text-muted' : 'text-dark'}`} style={{ fontSize: '14px' }}>{notif.title}</span>
                          <span className="ms-2 badge rounded-pill" style={{ backgroundColor: config.bg, color: config.color, fontSize: '11px' }}>{config.label}</span>
                          {!notif.isRead && <span className="ms-2 badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>New</span>}
                        </div>
                        <small className="text-muted flex-shrink-0 ms-3" style={{ fontSize: '12px' }}>{timeAgo(notif.time)}</small>
                      </div>
                      <p className="text-muted mb-0 mt-1" style={{ fontSize: '13px' }}>{notif.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
