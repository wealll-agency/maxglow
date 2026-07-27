import { X, Calendar, User, Phone, Mail, Package, FileText, CheckCircle, XCircle, CreditCard, RotateCcw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateRefundRequestStatus } from '../store/adminSlice.js';
import { useState } from 'react';
import Image from 'next/image';
import { useNotification } from '../context/NotificationContext';

export default function RefundDetailsModal({ refund, onClose }) {
  const dispatch = useDispatch();
  const [adminComment, setAdminComment] = useState(refund?.adminComment || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { showConfirm } = useNotification();

  if (!refund) return null;

  const handleStatusUpdate = async (status) => {
    const confirmed = await showConfirm(`Are you sure you want to mark this request as ${status}?`);
    if (!confirmed) return;
    setIsUpdating(true);
    await dispatch(updateRefundRequestStatus({ id: refund._id, status, adminComment }));
    setIsUpdating(false);
    onClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'badge bg-warning text-dark';
      case 'Approved': return 'badge bg-primary text-white';
      case 'Refunded': return 'badge bg-success text-white';
      case 'Rejected': return 'badge bg-danger text-white';
      default: return 'badge bg-secondary';
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1055 }} onClick={onClose}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
          <div className="modal-content shadow-lg border-0 rounded-4">
            
            {/* Header */}
            <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
              <h4 className="modal-title fw-bold d-flex align-items-center gap-2">
                <RotateCcw className="text-primary" size={24} />
                Refund Request Details
              </h4>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>

            {/* Body */}
            <div className="modal-body px-4 py-3">
              <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded-3 border">
                <div>
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Request ID</span>
                  <strong className="font-monospace">{refund._id}</strong>
                </div>
                <div className="text-end">
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Current Status</span>
                  <span className={getStatusBadge(refund.status)} style={{ fontSize: '0.9rem' }}>{refund.status}</span>
                </div>
                <div className="text-end">
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>Date Requested</span>
                  <strong>{new Date(refund.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="row g-4">
                {/* Customer Details */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                      <h6 className="fw-bold mb-0 text-muted text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Customer Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <User size={16} className="text-muted" /> <strong>{refund.user?.name || 'N/A'}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Mail size={16} className="text-muted" /> <span>{refund.user?.email || 'N/A'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={16} className="text-muted" /> <span>{refund.user?.phone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                      <h6 className="fw-bold mb-0 text-muted text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Order Information</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Package size={16} className="text-muted" /> Order: <strong className="font-monospace text-primary">{refund.order?._id}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <CreditCard size={16} className="text-muted" /> Amount Requested: <strong className="text-danger">₹{refund.amount?.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <CheckCircle size={16} className="text-muted" /> Order Status: <span>{refund.order?.orderStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Summary (if available) */}
              {refund.order?.items && (
                <div className="mt-4">
                  <h6 className="fw-bold text-muted text-uppercase mb-2" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Order Items</h6>
                  <div className="table-responsive border rounded-3">
                    <table className="table table-sm table-borderless mb-0 align-middle">
                      <thead className="table-light text-muted">
                        <tr>
                          <th className="ps-3 py-2 fw-normal" style={{ fontSize: '0.85rem' }}>Product</th>
                          <th className="py-2 fw-normal text-end pe-3" style={{ fontSize: '0.85rem' }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {refund.order.items.map((item, idx) => (
                          <tr key={idx} className="border-top">
                            <td className="ps-3 py-2">
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ width: '30px', height: '30px', backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                                  {item.product?.image && <Image src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://www.maxglowon.com'}${item.product.image}`} alt="" width={60} height={60} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>{item.product?.name || item.name}</span>
                              </div>
                            </td>
                            <td className="py-2 text-end pe-3 fw-medium" style={{ fontSize: '0.9rem' }}>₹{item.price?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Refund Reason & Comments */}
              <div className="mt-4 bg-light p-3 rounded-4 border">
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <FileText size={18} className="text-primary" /> Reason & Comments
                </h6>
                <div className="mb-3">
                  <label className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.85rem' }}>Customer Reason:</label>
                  <div className="bg-white p-2 rounded border-start border-3 border-danger shadow-sm">
                    {refund.reason}
                  </div>
                </div>
                {refund.customerComment && (
                  <div className="mb-3">
                    <label className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.85rem' }}>Customer Note:</label>
                    <div className="bg-white p-2 rounded shadow-sm" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                      "{refund.customerComment}"
                    </div>
                  </div>
                )}
                
                {/* Admin Comment Input */}
                <div className="mt-3 pt-3 border-top">
                  <label className="text-muted fw-bold d-block mb-1" style={{ fontSize: '0.85rem' }}>Admin Notes (Internal):</label>
                  <textarea 
                    className="form-control" 
                    rows="2"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    disabled={isUpdating}
                  ></textarea>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="modal-footer border-top-0 pt-0 pb-4 px-4 d-flex justify-content-between bg-white rounded-bottom-4">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={isUpdating}>
                Close
              </button>
              
              <div className="d-flex gap-2">
                {refund.status === 'Pending' && (
                  <>
                    <button className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => handleStatusUpdate('Rejected')} disabled={isUpdating}>
                      <XCircle size={18} /> Reject
                    </button>
                    <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => handleStatusUpdate('Approved')} disabled={isUpdating}>
                      <CheckCircle size={18} /> Approve
                    </button>
                  </>
                )}
                
                {refund.status === 'Approved' && (
                  <button className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => handleStatusUpdate('Refunded')} disabled={isUpdating}>
                    <CreditCard size={18} /> Mark as Refunded
                  </button>
                )}
                
                {refund.status !== 'Pending' && refund.status !== 'Approved' && (
                  <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => handleStatusUpdate(refund.status)} disabled={isUpdating}>
                    Update Notes
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
