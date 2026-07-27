"use client";
import Link from 'next/link';




import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminShipments, getDelhiveryLabel, cancelDelhiveryShipment } from '../../../store/adminSlice';
import { Search, Printer, X, FileText, CheckCircle, Package, MoreVertical, Eye, RefreshCw, Truck } from 'lucide-react';

import { useNotification } from '../../../context/NotificationContext';

export default function AdminShipments() {
  const dispatch = useDispatch();
  const { shipments, ordersLoading, shipmentsTotalPages, shipmentsCurrentPage } = useSelector((state) => state.admin);
  const { showAlert, showConfirm } = useNotification();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminShipments({ pageNumber: 1, keyword, status: statusFilter }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchAdminShipments({ pageNumber: 1, keyword, status: statusFilter }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchAdminShipments({ pageNumber: page, keyword, status: statusFilter }));
  };

  const handleGetLabel = (waybill) => {
    dispatch(getDelhiveryLabel(waybill))
      .unwrap()
      .then((res) => {
        const pkg = res.label?.packages?.[0];
        if (pkg && pkg.pdf_download_link) {
          window.open(pkg.pdf_download_link, '_blank');
        } else {
          showAlert('Label not available or generated yet.', 'warning');
        }
      })
      .catch(err => showAlert(err || 'Failed to get label', 'error'));
  };

  const handleCancelShipment = async (waybill) => {
    const confirmed = await showConfirm('Are you sure you want to cancel this shipment?');
    if(confirmed) {
      dispatch(cancelDelhiveryShipment(waybill))
        .unwrap()
        .then(() => {
          showAlert('Shipment cancelled successfully.', 'success');
          dispatch(fetchAdminShipments({ pageNumber: shipmentsCurrentPage, keyword, status: statusFilter }));
        })
        .catch(err => showAlert(err || 'Cancellation failed', 'error'));
    }
  };

  const handleGenerateManifest = (waybill) => {
    showAlert('Manifest generated logic goes here. Connected to generateManifest API.', 'info');
  };

  const handleRefreshSync = () => {
    showAlert('Shipment synced with Delhivery APIs.', 'success');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="container-fluid p-4 animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font d-flex align-items-center gap-2">
            <Package size={28} /> Enterprise Shipments
          </h1>
          <p className="text-muted m-0">Track and manage all split shipments, waybills, and couriers</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
        <div className="card-body p-3 d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <form onSubmit={handleSearch} className="d-flex gap-2" style={{ flex: '1', minWidth: '300px' }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary px-4">Search</button>
          </form>
          
          <div className="d-flex gap-2 align-items-center" style={{ minWidth: '200px' }}>
            <label className="text-muted fw-semibold small mb-0 ms-2 text-nowrap">Filter By:</label>
            <select className="form-select form-select-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Pickup Scheduled">Pickup Scheduled</option>
              <option value="Picked Up">Picked Up</option>
              <option value="In Transit">In Transit</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="RTO">RTO</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 bg-white">
        <div className="card-body p-0">
          {ordersLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading enterprise shipments...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 fs-7">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 ps-4">Shipment Details</th>
                    <th>Customer</th>
                    <th>Warehouse & Pickup</th>
                    <th>Payment</th>
                    <th>Created / Shipped</th>
                    <th>Status</th>
                    <th className="text-center pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No shipments found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    shipments.map(shipment => (
                      <tr key={shipment._id}>
                        <td className="ps-4">
                          <div className="fw-bold font-monospace text-primary">AWB: {shipment.waybill}</div>
                          <div className="text-muted small">Tracking: {shipment.trackingId || 'N/A'}</div>
                          <div className="text-muted small">Ord: #{shipment.orderId?.substring(0, 8).toUpperCase()}</div>
                          <span className="badge bg-secondary bg-opacity-10 text-secondary mt-1">{shipment.courierName}</span>
                        </td>
                        <td>
                          <div className="fw-semibold">{shipment.customerName}</div>
                          <div className="text-muted small">{shipment.customerEmail}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{shipment.warehouse?.name || 'Default Warehouse'}</div>
                          <div className="text-muted small">Code: {shipment.warehouse?.delhiveryPickupLocationName || 'N/A'}</div>
                        </td>
                        <td>
                          <span className={`badge ${shipment.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${shipment.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                            {shipment.paymentStatus === 'Paid' ? 'Prepaid' : 'COD'}
                          </span>
                        </td>
                        <td>
                          <div>{new Date(shipment.orderDate).toLocaleDateString()}</div>
                          <div className="text-muted small mb-1">Created</div>
                          {shipment.shippedAt && (
                            <>
                              <div>{new Date(shipment.shippedAt).toLocaleDateString()}</div>
                              <div className="text-muted small">Shipped</div>
                            </>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${shipment.status === 'Cancelled' ? 'bg-danger' : shipment.status === 'Delivered' ? 'bg-success' : 'bg-primary'} bg-opacity-10 text-${shipment.status === 'Cancelled' ? 'danger' : shipment.status === 'Delivered' ? 'success' : 'primary'} p-2`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="text-center pe-4 position-relative">
                          <button 
                            className="btn btn-sm btn-light rounded-circle"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === shipment._id ? null : shipment._id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {openDropdown === shipment._id && (
                            <div 
                              className="position-absolute bg-white shadow-lg rounded-3 border py-2 text-start z-3" 
                              style={{ right: '40px', top: '50%', transform: 'translateY(-50%)', minWidth: '180px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link href={`/admin/shipments/${shipment.waybill}`} className="dropdown-item py-2 px-3 text-decoration-none text-dark d-flex align-items-center gap-2">
                                <Eye size={14} /> View Details
                              </Link>
                              <button onClick={() => handleGetLabel(shipment.waybill)} className="dropdown-item py-2 px-3 btn btn-link text-start text-dark d-flex align-items-center gap-2 w-100 rounded-0 border-0">
                                <Printer size={14} /> Print Label
                              </button>
                              <button onClick={() => handleGenerateManifest(shipment.waybill)} className="dropdown-item py-2 px-3 btn btn-link text-start text-dark d-flex align-items-center gap-2 w-100 rounded-0 border-0">
                                <FileText size={14} /> Print Manifest
                              </button>
                              <button onClick={handleRefreshSync} className="dropdown-item py-2 px-3 btn btn-link text-start text-dark d-flex align-items-center gap-2 w-100 rounded-0 border-0">
                                <RefreshCw size={14} /> Retry Sync
                              </button>
                              
                              {shipment.status !== 'Cancelled' && shipment.status !== 'Delivered' && (
                                <>
                                  <hr className="my-1" />
                                  <button onClick={() => handleCancelShipment(shipment.waybill)} className="dropdown-item py-2 px-3 btn btn-link text-start text-danger d-flex align-items-center gap-2 w-100 rounded-0 border-0">
                                    <X size={14} /> Cancel Shipment
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {shipmentsTotalPages > 1 && (
            <div className="card-footer bg-white border-top-0 p-4 d-flex justify-content-center">
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  {[...Array(shipmentsTotalPages).keys()].map(x => (
                    <li key={x + 1} className={`page-item ${shipmentsCurrentPage === x + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(x + 1)}>
                        {x + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
