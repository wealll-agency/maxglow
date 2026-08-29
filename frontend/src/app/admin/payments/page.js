"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, markPaymentAsPaid } from '../../../store/adminSlice.js';
import { IndianRupee, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '../../../context/NotificationContext';

export default function PaymentHistoryPage() {
  const dispatch = useDispatch();
  const { showAlert } = useNotification();
  const { payments, paymentsLoading, error, paymentsCurrentPage, paymentsTotalPages } = useSelector((state) => state.admin);
  const [localLoadingId, setLocalLoadingId] = useState(null);

  useEffect(() => {
    dispatch(fetchPayments({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleMarkAsPaid = async (paymentId) => {
    setLocalLoadingId(paymentId);
    try {
      await dispatch(markPaymentAsPaid(paymentId)).unwrap();
      showAlert('Payment marked as received successfully!', 'success');
      // Refresh list to ensure we have the latest state (or rely on slice update)
      // We rely on slice update which is already handled in extraReducers
    } catch (err) {
      showAlert(err || 'Failed to mark payment as paid', 'error');
    } finally {
      setLocalLoadingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchPayments({ page: newPage, limit: 50 }));
  };

  const getStatusBadge = (status, paymentMode) => {
    const baseClass = "badge py-2 px-3 rounded-pill d-inline-flex align-items-center fw-semibold letter-spacing-sm";
    if (status === 'Captured') return <span className={`${baseClass} bg-success bg-opacity-10 text-success border border-success border-opacity-25`}><CheckCircle size={14} className="me-2"/> Received</span>;
    if (status === 'Failed') return <span className={`${baseClass} bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25`}><AlertCircle size={14} className="me-2"/> Failed</span>;
    if (status === 'Refunded') return <span className={`${baseClass} bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25`}>Refunded</span>;
    
    // Created/Pending
    if (paymentMode === 'COD') {
      return <span className={`${baseClass} bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25`}><Clock size={14} className="me-2"/> Pending Delivery</span>;
    }
    return <span className={`${baseClass} bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25`}><Clock size={14} className="me-2"/> Pending</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link href="/admin/dashboard" className="text-decoration-none text-muted">Dashboard</Link></li>
              <li className="breadcrumb-item active fw-bold" aria-current="page">Payment History</li>
            </ol>
          </nav>
          <h1 className="fw-bold m-0 display-font d-flex align-items-center gap-2">
            <IndianRupee size={28} className="text-brand" /> Payment History
          </h1>
          <p className="text-muted m-0 mt-1">Track all transactions, both online and Cash on Delivery.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-10 border-0 text-danger d-flex align-items-center gap-2 rounded-4">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0">Date / Time</th>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0">Customer</th>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0">Amount</th>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0">Method</th>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0">Status</th>
                  <th className="py-3 px-4 text-muted fw-semibold fs-7 border-0 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {paymentsLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-brand me-2" role="status"></div>
                      Loading payments...
                    </td>
                  </tr>
                ) : payments?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No payment records found.</td>
                  </tr>
                ) : (
                  payments?.map((payment) => (
                    <tr key={payment._id}>
                      <td className="py-3 px-4 border-bottom">
                        <div className="fw-semibold text-dark fs-7">{new Date(payment.createdAt).toLocaleDateString()}</div>
                        <div className="text-muted fs-8">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4 border-bottom">
                        <div className="fw-semibold text-dark fs-7">{payment.order?.user?.name || payment.order?.deliveryAddress?.name || 'Guest'}</div>
                        <div className="text-muted fs-8">{payment.order?.user?.phone || payment.order?.deliveryAddress?.phone || 'No Phone'}</div>
                      </td>
                      <td className="py-3 px-4 border-bottom fw-bold text-dark">
                        ₹{payment.amount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 border-bottom">
                        <span className={`fw-semibold fs-7 ${payment.paymentMode === 'COD' ? 'text-secondary' : 'text-primary'}`}>
                          {payment.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online (Razorpay)'}
                        </span>
                        {payment.paymentMode !== 'COD' && payment.razorpayPaymentId && (
                          <div className="text-muted fs-8 mt-1 text-truncate" style={{ maxWidth: '150px' }} title={payment.razorpayPaymentId}>
                            Txn: {payment.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-bottom">
                        {getStatusBadge(payment.status, payment.paymentMode)}
                      </td>
                      <td className="py-3 px-4 border-bottom text-end">
                        {payment.paymentMode === 'COD' && payment.status !== 'Captured' && (
                          <button 
                            className="btn btn-sm btn-brand rounded-pill px-3 py-1 fw-semibold fs-7 d-inline-flex align-items-center gap-1 shadow-sm"
                            onClick={() => handleMarkAsPaid(payment._id)}
                            disabled={localLoadingId === payment._id}
                          >
                            {localLoadingId === payment._id ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                              <><CheckCircle size={14} /> Got Payment</>
                            )}
                          </button>
                        )}
                        {payment.status === 'Captured' && payment.paymentMode === 'COD' && (
                          <span className="text-success fw-semibold fs-7"><i className="bi bi-check-all"></i> Settled</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {paymentsTotalPages > 1 && (
          <div className="card-footer bg-white border-top py-3 d-flex justify-content-center">
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0 pagination-sm">
                <li className={`page-item ${paymentsCurrentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(paymentsCurrentPage - 1)}>Previous</button>
                </li>
                {[...Array(paymentsTotalPages).keys()].map((num) => (
                  <li key={num + 1} className={`page-item ${paymentsCurrentPage === num + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(num + 1)}>{num + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${paymentsCurrentPage === paymentsTotalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(paymentsCurrentPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
