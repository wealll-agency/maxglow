'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Copy, Search } from 'lucide-react';
import api from '../../../utils/axiosConfig';
import { useNotification } from '../../../context/NotificationContext';

export default function AdminCombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showAlert, showConfirm } = useNotification();

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/combos/admin/all');
      if (res.data.success) {
        setCombos(res.data.combos);
      }
    } catch (error) {
      showAlert('Failed to fetch combos', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(
      'Are you sure you want to archive this combo? This will remove it from the store but preserve it for historical orders.'
    );
    if (confirmed) {
      try {
        const res = await api.delete(`/combos/admin/${id}`);
        if (res.data.success) {
          showAlert('Combo archived successfully', 'success');
          fetchCombos();
        }
      } catch (error) {
        showAlert('Failed to archive combo', 'danger');
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await api.post(`/combos/admin/${id}/duplicate`);
      if (res.data.success) {
        showAlert('Combo duplicated successfully. Status is Draft.', 'success');
        fetchCombos();
      }
    } catch (error) {
      showAlert('Failed to duplicate combo', 'danger');
    }
  };

  const filteredCombos = combos.filter(c => 
    c.status !== 'Archived' &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="admin-page animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="fw-bold m-0" style={{ color: '#162C18' }}>Combo Management</h2>
          <p className="text-muted m-0">Create and manage bundled products.</p>
        </div>
        <Link href="/admin/combos/create" className="btn btn-brand d-flex align-items-center gap-2">
          <Plus size={18} /> Create Combo
        </Link>
      </div>

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
        <div className="card-body p-0">
          <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
            <div className="position-relative" style={{ maxWidth: '300px', width: '100%' }}>
              <Search className="position-absolute text-muted" size={16} style={{ top: '10px', left: '16px' }} />
              <input
                type="text"
                className="form-control form-control-sm ps-5 rounded-pill"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {!search && (
                <span className="position-absolute text-muted" style={{ top: '9px', left: '44px', fontSize: '0.875rem', pointerEvents: 'none' }}>
                  Search combos by name or SKU...
                </span>
              )}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light" style={{ borderBottom: '1px solid #dee2e6' }}>
                <tr>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Image</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Name</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>SKU</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Price</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Components</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem' }}>Status</th>
                  <th className="py-3 px-4 text-muted fw-bold" style={{ fontSize: '0.9rem', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCombos.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No combos found.
                    </td>
                  </tr>
                ) : (
                  filteredCombos.map(row => (
                    <tr key={row._id} style={{ fontSize: '0.9rem' }}>
                      <td className="px-4">
                        <div style={{ width: '50px', height: '50px', position: 'relative', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                          {row.image ? (
                            <Image src={row.image.replace('/assets/images/', '/')} alt={row.name} fill style={{ objectFit: 'contain', padding: '4px' }} sizes="50px" />
                          ) : (
                            <div className="w-100 h-100 d-flex justify-content-center align-items-center text-muted" style={{ fontSize: '10px' }}>No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 fw-bold text-dark">{row.name}</td>
                      <td className="px-4 text-muted">{row.sku}</td>
                      <td className="px-4 fw-bold">₹{row.comboPrice}</td>
                      <td className="px-4">
                        <span className="badge bg-secondary">{row.components?.length || 0} Items</span>
                      </td>
                      <td className="px-4">
                        <span className={`badge ${
                          row.status === 'Active' ? 'bg-success' : 
                          row.status === 'Draft' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex gap-2">
                          <Link href={`/admin/combos/${row._id}`} className="btn btn-sm btn-outline-primary py-1 px-2" title="Edit">
                            <Edit size={14} />
                          </Link>
                          <button onClick={() => handleDuplicate(row._id)} className="btn btn-sm btn-outline-secondary py-1 px-2" title="Duplicate">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => handleDelete(row._id)} className="btn btn-sm btn-outline-danger py-1 px-2" title="Archive" disabled={row.status === 'Archived'}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
