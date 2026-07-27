"use client";

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import api from '@/utils/axiosConfig';
import { Bell, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function InventoryNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useNotification();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/admin/stock');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font d-flex align-items-center gap-2">
            <Bell size={28} className="text-brand" /> Inventory Notifications
          </h1>
          <p className="text-muted m-0">Manage customer restock requests</p>
        </div>
        <button onClick={fetchNotifications} className="btn btn-light d-flex align-items-center gap-2" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <Bell size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Notifications</h5>
            <p className="text-muted">No stock alert requests from customers at the moment.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted">
                <tr>
                  <th className="ps-4">Product Details</th>
                  <th>Customer Email</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif._id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '45px', height: '45px', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                          <Image
                            src={notif.product?.image || '/placeholder-product.png'}
                            alt={notif.product?.name || 'Product'}
                            fill
                            sizes="45px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{notif.product?.name || 'Unknown Product'}</h6>
                          <small className="text-muted">Stock: {notif.product?.stock ?? 0}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium text-dark">{notif.email}</span>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td>
                      {notif.notified ? (
                        <span className="badge bg-success-subtle text-success px-2 py-1 rounded d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Notified
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning px-2 py-1 rounded d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
