"use client";



import { useState, useEffect } from 'react';
import api from '@/utils/axiosConfig';
import { Tag, Trash2, PlusCircle, AlertCircle } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.maxglowon.com/api';

export default function CouponManagerPage() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showConfirm, showAlert } = useNotification();
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    expiryDate: '',
    usageLimit: 100,
    applicableProducts: [],
    isCombo: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsRes, productsRes] = await Promise.all([
        api.get(`/coupons`),
        api.get(`/products`)
      ]);
      setCoupons(couponsRes.data.coupons || []);
      setProducts(productsRes.data.products || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load coupons or products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({ ...formData, applicableProducts: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.isCombo && formData.applicableProducts.length < 2) {
      setError('Combo coupons must have at least 2 applicable products selected.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/coupons`, formData);
      setSuccess('Coupon created successfully!');
      setFormData({
        code: '',
        discountPercentage: '',
        expiryDate: '',
        usageLimit: 100,
        applicableProducts: [],
        isCombo: false
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Are you sure you want to delete this coupon?');
    if (!confirmed) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Coupon Manager...</div>;

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Coupon Manager</h1>
          <p className="text-muted m-0">Create product-specific discounts.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <div className="row g-4">
        {/* Create Coupon Form */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <PlusCircle size={20} className="text-brand" /> Create New Coupon
            </h5>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Coupon Code</label>
                <input 
                  type="text" 
                  className="form-control bg-light border-0" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  className="form-control bg-light border-0" 
                  value={formData.discountPercentage} 
                  onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                  required 
                  min="1" max="100"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fs-7 fw-semibold">Expiry Date</label>
                <input 
                  type="date" 
                  className="form-control bg-light border-0" 
                  value={formData.expiryDate} 
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  required 
                />
              </div>

              <div className="mb-3 form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="isComboCheck"
                  checked={formData.isCombo}
                  onChange={(e) => setFormData({...formData, isCombo: e.target.checked})}
                />
                <label className="form-check-label fs-7 fw-semibold" htmlFor="isComboCheck">
                  Is this a Combo Coupon?
                </label>
                <div className="form-text fs-8 text-muted">If checked, customer must have ALL selected products below in their cart to use this coupon. Minimum 2 products required.</div>
              </div>

              <div className="mb-4">
                <label className="form-label fs-7 fw-semibold">Applicable Products</label>
                <p className="text-muted fs-8 mb-2">Hold Ctrl (Windows) or Cmd (Mac) to select multiple products.</p>
                <select 
                  multiple 
                  className="form-control bg-light border-0" 
                  style={{ height: '150px' }}
                  value={formData.applicableProducts}
                  onChange={handleProductSelection}
                  required
                >
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} (₹{product.price})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-brand w-100 py-2 fw-semibold" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>

        {/* Coupon List */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <Tag size={20} className="text-info" /> Active Coupons
            </h5>

            {coupons.length === 0 ? (
              <div className="text-center py-5">
                <AlertCircle size={48} className="text-muted mb-3 opacity-50" />
                <h6 className="fw-bold">No coupons found</h6>
                <p className="text-muted fs-7">Create your first product-specific coupon from the form.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle fs-7">
                  <thead className="table-light text-muted">
                    <tr>
                      <th className="fw-semibold rounded-start">Code</th>
                      <th className="fw-semibold">Discount</th>
                      <th className="fw-semibold">Applicable Products</th>
                      <th className="fw-semibold">Expiry</th>
                      <th className="fw-semibold rounded-end text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td>
                          <span className="badge bg-dark px-2 py-1 fs-8 font-monospace">{coupon.code}</span>
                          {coupon.isCombo && <span className="badge bg-primary ms-2 px-2 py-1 fs-8">COMBO</span>}
                        </td>
                        <td className="fw-bold text-success">{coupon.discountPercentage}% OFF</td>
                        <td style={{ maxWidth: '200px' }}>
                          {coupon.applicableProducts && coupon.applicableProducts.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {coupon.applicableProducts.map(p => (
                                <span key={p._id} className="badge bg-light text-dark border text-truncate" style={{ maxWidth: '180px' }}>
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted fst-italic">All Products</span>
                          )}
                        </td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-light text-danger hover-light-red"
                            onClick={() => handleDelete(coupon._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
