"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';




import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchShipmentByWaybill, getDelhiveryLabel, cancelDelhiveryShipment } from '@/store/adminSlice';
import { Truck, MapPin, User, Package, Calendar, Activity, ArrowLeft, Printer, FileText, X, RefreshCw } from 'lucide-react';

import { useNotification } from '@/context/NotificationContext';

export default function ShipmentDetails() {
  const { waybill } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { selectedShipment, ordersLoading } = useSelector((state) => state.admin);
  const { showAlert, showConfirm } = useNotification();

  useEffect(() => {
    if (waybill) {
      dispatch(fetchShipmentByWaybill(waybill));
    }
  }, [dispatch, waybill]);

  if (ordersLoading || !selectedShipment) {
    return (
      <div className="container-fluid p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  const { order, shipment } = selectedShipment;
  
  // Calculate shipment weight (Mocked or derived)
  const totalWeight = order.items.reduce((acc, item) => acc + (item.quantity * 0.5), 0); // 0.5kg avg per item

  return (
    <div className="container-fluid p-4 animate-fade-in pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => router.back()} className="btn btn-light rounded-circle shadow-sm border" style={{ width: '40px', height: '40px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="fw-bold m-0 display-font">AWB: {shipment.waybill}</h1>
            <p className="text-muted m-0">Order: #{order._id?.substring(0, 8).toUpperCase()} • Created on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark d-flex align-items-center gap-2" onClick={() => dispatch(getDelhiveryLabel(waybill))}>
            <Printer size={16} /> Print Label
          </button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => showAlert('Manifest generated', 'info')}>
            <FileText size={16} /> Print Manifest
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Tracking Timeline */}
          <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold d-flex align-items-center gap-2 m-0"><Activity size={20} className="text-primary"/> Live Tracking</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3 border">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold mb-1">Current Status</div>
                  <h4 className={`m-0 fw-bold text-${shipment.status === 'Delivered' ? 'success' : shipment.status === 'Cancelled' ? 'danger' : 'primary'}`}>
                    {shipment.status}
                  </h4>
                  {shipment.lastScan && <div className="text-muted small mt-1">Location: {shipment.lastScan}</div>}
                </div>
                <div className="text-end">
                  <div className="text-muted small text-uppercase fw-semibold mb-1">Courier Partner</div>
                  <h5 className="m-0 fw-bold">{shipment.courierName}</h5>
                  <div className="text-muted small mt-1 text-monospace">TRK: {shipment.trackingId || 'N/A'}</div>
                </div>
              </div>

              {/* Mock Timeline */}
              <div className="position-relative ms-3 mt-4" style={{ borderLeft: '2px solid #e9ecef' }}>
                <div className="position-relative mb-4 ps-4">
                  <span className="position-absolute bg-primary rounded-circle" style={{ width: '12px', height: '12px', left: '-7px', top: '5px', border: '2px solid white', boxShadow: '0 0 0 2px var(--primary-color)' }}></span>
                  <div className="fw-bold">{shipment.status}</div>
                  <div className="text-muted small">{new Date(shipment.lastUpdated || Date.now()).toLocaleString()} • {shipment.currentLocation || 'N/A'}</div>
                </div>
                <div className="position-relative mb-4 ps-4">
                  <span className="position-absolute bg-secondary rounded-circle" style={{ width: '12px', height: '12px', left: '-7px', top: '5px', border: '2px solid white' }}></span>
                  <div className="fw-bold text-secondary">Shipment Manifested</div>
                  <div className="text-muted small">{new Date(shipment.shippedAt || Date.now()).toLocaleString()} • Processing Center</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products */}
          <div className="card shadow-sm border-0 rounded-4 bg-white">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold d-flex align-items-center gap-2 m-0"><Package size={20} className="text-primary"/> Package Contents</h5>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead className="border-bottom">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="border-bottom">
                        <td>
                          <div className="d-flex align-items-center gap-3 py-2">
                            <div className="bg-light rounded p-1" style={{ width: '40px', height: '40px' }}>
                              <img src={item.product?.images?.[0] || '/placeholder.jpg'} alt={item.product?.name} className="img-fluid rounded object-fit-cover w-100 h-100" />
                            </div>
                            <div className="fw-medium text-dark">{item.product?.name || 'Unknown Product'}</div>
                          </div>
                        </td>
                        <td className="text-muted font-monospace small">{item.product?.sku || 'N/A'}</td>
                        <td className="fw-bold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Customer & Address */}
          <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold d-flex align-items-center gap-2 m-0"><User size={20} className="text-primary"/> Delivery Details</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <div className="fw-bold text-dark">{order.deliveryAddress.name}</div>
                <div className="text-muted small">{order.user?.email}</div>
                <div className="text-muted small">{order.deliveryAddress.phone}</div>
              </div>
              <div className="p-3 bg-light rounded-3">
                <div className="d-flex align-items-start gap-2">
                  <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div className="small text-muted">
                    {order.deliveryAddress.address}, {order.deliveryAddress.locality && `${order.deliveryAddress.locality}, `}
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - <span className="fw-bold text-dark">{order.deliveryAddress.pincode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Warehouse */}
          <div className="card shadow-sm border-0 rounded-4 bg-white mb-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold d-flex align-items-center gap-2 m-0"><Truck size={20} className="text-primary"/> Dispatch Info</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Origin Warehouse</div>
                <div className="fw-bold text-dark">{shipment.warehouse?.name || 'Default Warehouse'}</div>
                <div className="small text-muted">{shipment.warehouse?.city}, {shipment.warehouse?.state}</div>
                <div className="small text-muted font-monospace">Pickup Code: {shipment.warehouse?.delhiveryPickupLocationName || 'N/A'}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-muted small text-uppercase fw-semibold mb-1">Payment Details</div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-medium">Method:</span>
                  <span className={`badge ${order.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
                    {order.paymentMode || (order.paymentStatus === 'Paid' ? 'Prepaid' : 'COD')}
                  </span>
                </div>
                <div className="d-flex align-items-center justify-content-between mt-2">
                  <span className="fw-medium">Total:</span>
                  <span className="fw-bold text-dark">₹{order.totalAmount}</span>
                </div>
              </div>

              <div>
                <div className="text-muted small text-uppercase fw-semibold mb-1">Package Specs</div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-medium">Est. Weight:</span>
                  <span className="text-dark">{totalWeight.toFixed(2)} kg</span>
                </div>
              </div>
            </div>
          </div>
          
          {shipment.status !== 'Cancelled' && shipment.status !== 'Delivered' && (
            <button className="btn btn-outline-danger w-100 d-flex justify-content-center align-items-center gap-2" onClick={async () => {
              const confirmed = await showConfirm('Cancel this shipment?');
              if(confirmed) {
                dispatch(cancelDelhiveryShipment(waybill))
                  .unwrap()
                  .then(() => {
                    showAlert('Cancelled', 'success');
                    dispatch(fetchShipmentByWaybill(waybill));
                  });
              }
            }}>
              <X size={18} /> Cancel Shipment
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
