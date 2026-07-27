'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import api from '../../../utils/axiosConfig';
import { Bell, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

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

      <div className="card shadow-sm border-0 rounded-4 bg-white p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-brand" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Bell size={48} className="mb-3 opacity-25" />
            <p className="fs-5 m-0">No stock notifications found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Requested At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: '40px', height: '40px', position: 'relative' }} className="rounded overflow-hidden bg-light border">
                          <Image
                            src={notif.product?.images?.[0]?.replace('/assets/images/', '/') || '/placeholder.png'}
                            alt={notif.product?.name || 'Product'}
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized
                          />
                        </div>
                        <span className="fw-medium text-dark">{notif.product?.name || 'Unknown Product'}</span>
                      </div>
                    </td>
                    <td><span className="font-monospace fs-7 text-muted">{notif.product?.sku || 'N/A'}</span></td>
                    <td>{notif.user?.name || 'Guest'}</td>
                    <td>{notif.email}</td>
                    <td>{new Date(notif.createdAt).toLocaleString()}</td>
                    <td>
                      {notif.status === 'Completed' ? (
                        <span className="badge bg-success bg-opacity-10 text-success d-inline-flex align-items-center gap-1">
                          <CheckCircle size={12} /> Completed
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center gap-1">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
