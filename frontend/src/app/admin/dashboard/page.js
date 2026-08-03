"use client";

'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../../store/adminSlice.js';
import Link from 'next/link';
import { IndianRupee, ShoppingBag, Users, AlertTriangle, Star, RefreshCw, Store, Box, Package, Truck, CheckCircle, XCircle, Clock, RotateCcw, ShieldAlert, FileText, Activity } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const EarningStatistics = dynamic(() => import('../../../components/admin/EarningStatistics'), { 
  ssr: false,
  loading: () => <div className="d-flex justify-content-center align-items-center" style={{height: 300}}>Loading chart...</div>
});

export default function DashboardPage() {
  const dispatch = useDispatch();

  const { stats, salesOverview, topProducts, lowStockDetails, loading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Console Dashboard</h1>
          <p className="text-muted m-0">Welcome back, {user?.name || 'Admin'}. Here is what is happening today.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 mt-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading dashboard metrics...</span>
          </div>
        </div>
      ) : error || !stats ? (
        <div className="text-center py-5">
          <div className="alert alert-danger d-inline-block">
            Failed to load dashboard metrics. {error || 'No data available.'}
          </div>
        </div>
      ) : (
        <>

      {/* Business Analytics */}
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Activity size={18} className="text-brand" /> Business Analytics
      </h5>
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg-4">
          <div className="metric-card d-flex align-items-center justify-content-between p-4 bg-white rounded-4 shadow-sm border-0 h-100">
            <div>
              <span className="text-muted fs-7 d-block mb-1">Total Sale</span>
              <h3 className="fw-bold m-0 text-dark">₹{stats.totalSales.toLocaleString()}</h3>
            </div>
            <div className="rounded-circle p-3 bg-success bg-opacity-10 text-success">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>


        <div className="col-md-4 col-lg-4">
          <div className="metric-card d-flex align-items-center justify-content-between p-4 bg-white rounded-4 shadow-sm border-0 h-100">
            <div>
              <span className="text-muted fs-7 d-block mb-1">Total Products</span>
              <h3 className="fw-bold m-0 text-dark">{stats.totalProducts}</h3>
            </div>
            <div className="rounded-circle p-3 bg-warning bg-opacity-10 text-warning">
              <Box size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-4 col-lg-4">
          <div className="metric-card d-flex align-items-center justify-content-between p-4 bg-white rounded-4 shadow-sm border-0 h-100">
            <div>
              <span className="text-muted fs-7 d-block mb-1">Total Customers</span>
              <h3 className="fw-bold m-0 text-dark">{stats.totalCustomers}</h3>
            </div>
            <div className="rounded-circle p-3 bg-info bg-opacity-10 text-info">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Statuses */}
      <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Package size={18} className="text-info" /> Orders Data
      </h5>
      <div className="row g-3 mb-4">
        {[
          { label: 'Pending', count: stats.orderStatuses.Placed, icon: <Clock size={18} />, color: 'text-warning', query: 'Placed' },
          { label: 'Confirmed', count: stats.orderStatuses.Confirmed, icon: <CheckCircle size={18} />, color: 'text-primary', query: 'Confirmed' },
          { label: 'Packaging', count: stats.orderStatuses.Packed, icon: <Package size={18} />, color: 'text-info', query: 'Packed' },
          { label: 'Out for delivery', count: stats.orderStatuses.Shipped, icon: <Truck size={18} />, color: 'text-brand', query: 'Shipped' },
          { label: 'Delivered', count: stats.orderStatuses.Delivered, icon: <CheckCircle size={18} />, color: 'text-success', query: 'Delivered' },
          { label: 'Canceled', count: stats.orderStatuses.Cancelled, icon: <XCircle size={18} />, color: 'text-danger', query: 'Cancelled' },
          { label: 'Returned', count: 0, icon: <RotateCcw size={18} />, color: 'text-secondary', query: 'Returned' },
          { label: 'Failed to delivery', count: 0, icon: <ShieldAlert size={18} />, color: 'text-danger', query: 'Failed' }
        ].map((status, idx) => (
          <div key={idx} className="col-6 col-md-3">
            <Link href={`/admin/orders?status=${status.query}`} className="text-decoration-none">
              <div className="d-flex align-items-center gap-2 p-3 bg-white rounded-3 shadow-sm border-0 h-100 hover-shadow transition-all">
                <div className={status.color}>{status.icon}</div>
                <div className="flex-grow-1">
                  <span className="text-muted fs-8 d-block">{status.label}</span>
                  <strong className="text-dark fs-6">{status.count}</strong>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>



      {/* Sales Overview Chart Section */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <EarningStatistics data={salesOverview} />
        </div>

        {/* Top Selling Products */}
        <div className="col-12">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white h-100">
            <h5 className="fw-bold mb-3">Top Selling Products</h5>
            <div className="d-flex flex-column gap-3">
              {topProducts.map((prod) => (
                <div key={prod._id} className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Image
                      src={prod.image || 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=80'}
                      alt={prod.name}
                      width={40}
                      height={40}
                      className="rounded object-fit-cover"
                      unoptimized={true}
                    />
                    <div>
                      <span className="fw-bold d-block text-dark fs-7 text-truncate" style={{ maxWidth: '140px' }}>{prod.name}</span>
                      <small className="text-muted fs-8">{prod.unitsSold} units sold</small>
                    </div>
                  </div>
                  <span className="fw-semibold text-dark fs-7">₹{prod.revenueGenerated.toLocaleString()}</span>
                </div>
              ))}
              {topProducts.length === 0 && <p className="text-muted text-center py-4">No purchases captured yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Low stock Alerts */}
      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
            <AlertTriangle size={20} className="text-danger" /> Low Stock Alerts
          </h5>
          <Link href="/admin/inventory" className="btn btn-sm btn-brand-outline">Manage Inventory</Link>
        </div>

        {lowStockDetails.length === 0 ? (
          <p className="text-success fw-medium m-0 fs-7">All products are healthy and above reorder thresholds.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless align-middle m-0 fs-7">
              <thead>
                <tr className="border-bottom text-muted">
                  <th>Product</th>
                  <th>Batch</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStockDetails.map((inv) => (
                  <tr key={inv._id} className="border-bottom">
                    <td className="fw-bold py-2">{inv.product?.name}</td>
                    <td className="font-monospace">{inv.batchNumber}</td>
                    <td>{inv.product?.category}</td>
                    <td className="text-danger fw-bold">{inv.stockQuantity} units</td>
                    <td>
                      <span className="badge bg-danger bg-opacity-10 text-danger">Low Stock</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



        </>
      )}
    </div>
  );
}
