'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRefundRequests } from '../../../store/adminSlice';
import RefundDetailsModal from '../../../components/RefundDetailsModal';
import { Search, Eye, Download, ChevronDown, FolderOpen } from 'lucide-react';

export default function RefundsPageClient({ status }) {
  const dispatch = useDispatch();
  const { refunds, refundsLoading } = useSelector((state) => state.admin);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchRefundRequests(status));
  }, [dispatch, status]);

  const filteredRefunds = refunds?.filter(ref => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ref.order?._id.toLowerCase().includes(term) ||
      ref.user?.name.toLowerCase().includes(term) ||
      ref.user?.phone?.toLowerCase().includes(term) ||
      ref._id.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="container-fluid py-4 px-4">
      
      {/* Title */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <h3 className="fw-bold m-0 text-dark display-font d-flex align-items-center gap-2">
          <span className="text-success">
            <FolderOpen size={24} />
          </span>
          {status} Refund Requests
        </h3>
        <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-1 fs-6 border border-success border-opacity-25">
          {filteredRefunds.length}
        </span>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          
          {/* Search */}
          <div className="d-flex" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-dark px-4 border-0" style={{ backgroundColor: '#162C18' }}>
                Search
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-3 align-items-center">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded px-3 py-2">
              <Download size={16} />
              Export
              <ChevronDown size={16} />
            </button>
            <select className="form-select border-secondary text-dark bg-light" style={{ minWidth: '120px' }}>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center" style={{ minWidth: '800px' }}>
            <thead className="table-light">
              <tr>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '60px' }}>SL</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '180px' }}>Order Id</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '220px' }}>Product Info</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '220px' }}>Customer Info</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '130px' }}>Total Amount</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '160px' }}>Refund Status</th>
                <th className="py-3 text-muted fw-bold border-bottom-0" style={{ fontSize: '0.85rem', width: '100px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {refundsLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-bottom" style={{ opacity: 0.5 }}>
                    <td className="py-3"><div className="bg-light rounded mx-auto" style={{ width: '20px', height: '18px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded mx-auto" style={{ width: '120px', height: '18px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded" style={{ width: '150px', height: '18px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded" style={{ width: '120px', height: '18px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded mx-auto" style={{ width: '60px', height: '18px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded mx-auto" style={{ width: '80px', height: '24px', borderRadius: '50px' }}></div></td>
                    <td className="py-3"><div className="bg-light rounded-circle mx-auto" style={{ width: '32px', height: '32px' }}></div></td>
                  </tr>
                ))
              ) : filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center opacity-50 py-4">
                      <FolderOpen size={80} strokeWidth={1} className="text-muted mb-3" />
                      <p className="text-muted m-0 fs-6">No data to show</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((ref, index) => (
                  <tr key={ref._id} className="border-bottom">
                    <td className="py-3 text-dark">{index + 1}</td>
                    <td className="py-3">
                      <span className="text-primary fw-medium">{ref.order?._id}</span>
                    </td>
                    <td className="py-3 text-start">
                      {ref.order?.items && ref.order.items.length > 0 ? (
                        <div className="d-flex flex-column">
                          <span className="text-dark fw-medium text-truncate" style={{ maxWidth: '200px' }}>
                            {ref.order.items[0].name || ref.order.items[0].product?.name}
                          </span>
                          {ref.order.items.length > 1 && (
                            <small className="text-muted">+ {ref.order.items.length - 1} more items</small>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td className="py-3 text-start">
                      <div className="d-flex flex-column">
                        <span className="text-dark fw-medium">{ref.user?.name || 'N/A'}</span>
                        <small className="text-muted">{ref.user?.phone || ref.user?.email}</small>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="fw-medium text-dark">₹{ref.amount?.toFixed(2)}</span>
                    </td>
                    <td className="py-3">
                      <span className={`badge bg-opacity-10 rounded-pill px-3 py-2 ${
                        ref.status === 'Pending' ? 'bg-warning text-warning' :
                        ref.status === 'Approved' ? 'bg-primary text-primary' :
                        ref.status === 'Refunded' ? 'bg-success text-success' :
                        'bg-danger text-danger'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button 
                        className="btn btn-sm btn-light rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', padding: 0 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedRefund(ref); }}
                        title="View Details"
                      >
                        <Eye size={16} className="text-success" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRefund && (
        <RefundDetailsModal 
          refund={selectedRefund} 
          onClose={() => setSelectedRefund(null)} 
        />
      )}
    </div>
  );
}
