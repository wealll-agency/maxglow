"use client";

import { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { 
  Tag, Trash2, PlusCircle, AlertCircle, BarChart2, Download, 
  Calendar, Users, MapPin, TrendingUp, DollarSign, Filter, X, RefreshCw, ShoppingBag, Info, Check 
} from 'lucide-react';
import { useNotification } from '../../../context/NotificationContext';

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

  // Analytics Modal States
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [preset, setPreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCancelled, setIncludeCancelled] = useState(true);
  const [groupBy, setGroupBy] = useState('day');
  const [activeTab, setActiveTab] = useState('geographics');

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

  const handleToggleAllProducts = () => {
    setFormData({ ...formData, applicableProducts: [] });
  };

  const handleToggleProduct = (productId) => {
    let updated;
    const isStorewide = formData.applicableProducts.length === 0;

    if (isStorewide) {
      updated = [productId];
    } else if (formData.applicableProducts.includes(productId)) {
      updated = formData.applicableProducts.filter(id => id !== productId);
    } else {
      updated = [...formData.applicableProducts, productId];
    }

    if (updated.length === products.length) {
      updated = [];
    }

    setFormData({ ...formData, applicableProducts: updated });
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

  // Open Analytics Modal and fetch data
  const openAnalyticsModal = (coupon) => {
    setSelectedCoupon(coupon);
    setPreset('all');
    setStartDate('');
    setEndDate('');
    setIncludeCancelled(true);
    setGroupBy('day');
    setActiveTab('geographics');
    fetchAnalytics(coupon._id, { preset: 'all', includeCancelled: true, groupBy: 'day' });
  };

  const closeAnalyticsModal = () => {
    setSelectedCoupon(null);
    setAnalyticsData(null);
  };

  const fetchAnalytics = async (couponId, overrideParams = {}) => {
    try {
      setAnalyticsLoading(true);
      const params = new URLSearchParams();
      
      const currentPreset = overrideParams.preset !== undefined ? overrideParams.preset : preset;
      const currentIncCancelled = overrideParams.includeCancelled !== undefined ? overrideParams.includeCancelled : includeCancelled;
      const currentGroupBy = overrideParams.groupBy !== undefined ? overrideParams.groupBy : groupBy;
      const currentStart = overrideParams.startDate !== undefined ? overrideParams.startDate : startDate;
      const currentEnd = overrideParams.endDate !== undefined ? overrideParams.endDate : endDate;

      if (currentPreset && currentPreset !== 'all') params.append('preset', currentPreset);
      if (currentIncCancelled) params.append('includeCancelled', 'true');
      if (currentGroupBy) params.append('groupBy', currentGroupBy);
      if (currentStart) params.append('from', currentStart);
      if (currentEnd) params.append('to', currentEnd);

      const res = await api.get(`/coupons/${couponId}/analytics?${params.toString()}`);
      if (res.data.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      showAlert(err.response?.data?.message || 'Failed to load coupon analytics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleFilterChange = (newPreset) => {
    setPreset(newPreset);
    if (newPreset !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
    if (selectedCoupon) {
      fetchAnalytics(selectedCoupon._id, { preset: newPreset, startDate: '', endDate: '' });
    }
  };

  const handleToggleCancelled = (e) => {
    const val = e.target.checked;
    setIncludeCancelled(val);
    if (selectedCoupon) {
      fetchAnalytics(selectedCoupon._id, { includeCancelled: val });
    }
  };

  const handleGroupByChange = (val) => {
    setGroupBy(val);
    if (selectedCoupon) {
      fetchAnalytics(selectedCoupon._id, { groupBy: val });
    }
  };

  const handleApplyCustomDates = () => {
    if (selectedCoupon) {
      fetchAnalytics(selectedCoupon._id, { preset: 'custom', startDate, endDate });
    }
  };

  // CSV Export Utility
  const exportAnalyticsCSV = () => {
    if (!analyticsData || !selectedCoupon) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Coupon Analytics Report - ${selectedCoupon.code}\n`;
    csvContent += `Generated At: ${new Date().toLocaleString()}\n\n`;

    // Summary
    csvContent += `SUMMARY METRICS\n`;
    csvContent += `Total Uses,Total Discount Given (INR),Total Revenue Generated (INR),Average Order Value (INR)\n`;
    csvContent += `${analyticsData.summary.totalUses},${analyticsData.summary.totalDiscountGiven},${analyticsData.summary.totalRevenueGenerated},${analyticsData.summary.avgOrderValue}\n\n`;

    // Area & Geographic Usage
    csvContent += `AREA / LOCALITY WISE USAGE\n`;
    csvContent += `Area/Locality,Uses,Discount (INR),Revenue (INR)\n`;
    (analyticsData.geographics?.areas || []).forEach(row => {
      csvContent += `"${row.area}",${row.uses},${row.discount},${row.revenue}\n`;
    });
    csvContent += `\n`;

    csvContent += `PINCODE WISE USAGE\n`;
    csvContent += `Pincode,Uses,Discount (INR),Revenue (INR)\n`;
    (analyticsData.geographics?.pincodes || []).forEach(row => {
      csvContent += `"${row.pincode}",${row.uses},${row.discount},${row.revenue}\n`;
    });
    csvContent += `\n`;

    csvContent += `CITY WISE USAGE\n`;
    csvContent += `City,Uses,Discount (INR),Revenue (INR)\n`;
    (analyticsData.geographics?.cities || []).forEach(row => {
      csvContent += `"${row.city}",${row.uses},${row.discount},${row.revenue}\n`;
    });
    csvContent += `\n`;

    csvContent += `STATE WISE USAGE\n`;
    csvContent += `State,Uses,Discount (INR),Revenue (INR)\n`;
    (analyticsData.geographics?.states || []).forEach(row => {
      csvContent += `"${row.state}",${row.uses},${row.discount},${row.revenue}\n`;
    });
    csvContent += `\n`;

    // Timeline
    csvContent += `USAGE TIMELINE\n`;
    csvContent += `Date,Uses,Discount Amount (INR),Revenue Generated (INR)\n`;
    (analyticsData.timeline || []).forEach(row => {
      csvContent += `"${row.date}",${row.uses},${row.discountAmount},${row.revenueGenerated}\n`;
    });
    csvContent += `\n`;

    // Top Customers
    csvContent += `TOP CUSTOMERS\n`;
    csvContent += `Name,Email,Phone,Times Used,Last Used,Total Discount (INR),Total Spent (INR)\n`;
    (analyticsData.topCustomers || []).forEach(row => {
      csvContent += `"${row.name}","${row.email}","${row.phone}",${row.timesUsed},"${new Date(row.lastUsed).toLocaleDateString()}",${row.totalDiscountReceived},${row.totalAmountSpent}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coupon-analytics-${selectedCoupon.code}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-5 text-center">Loading Coupon Manager...</div>;

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold m-0 display-font">Coupon Manager</h1>
          <p className="text-muted m-0">Create, manage, and analyze product & storewide discounts.</p>
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

              {/* Combo Coupon Card */}
              <div 
                className={`mb-4 p-3 rounded-3 border cursor-pointer transition-all ${
                  formData.isCombo ? 'bg-primary bg-opacity-10 border-primary shadow-sm' : 'bg-light border-gray'
                }`}
                onClick={() => setFormData({ ...formData, isCombo: !formData.isCombo })}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className={`d-flex align-items-center justify-content-center rounded-2 transition-all flex-shrink-0 ${
                      formData.isCombo ? 'bg-primary text-white border-primary' : 'bg-white border text-transparent'
                    }`}
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: formData.isCombo ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                      backgroundColor: formData.isCombo ? '#3b82f6' : '#ffffff'
                    }}
                  >
                    <Check size={14} strokeWidth={3.5} color={formData.isCombo ? '#ffffff' : 'transparent'} />
                  </div>
                  <div>
                    <span className={`fs-7 ${formData.isCombo ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`}>
                      Is this a Combo Coupon?
                    </span>
                  </div>
                </div>
                <div className="text-muted fs-8 mt-2 ms-4 ps-2">
                  If checked, customer must have ALL selected products below in their cart to use this coupon. Minimum 2 products required.
                </div>
              </div>

              {/* Applicable Products Section */}
              <div className="mb-4">
                <label className="form-label fs-7 fw-semibold text-dark mb-1">Applicable Products</label>
                <p className="text-muted fs-8 mb-2">Select "All Products" for storewide discount or check specific products below.</p>
                
                <div className="border rounded-3 bg-white p-2">
                  {/* All Products (Storewide) Option */}
                  <div 
                    className={`p-2.5 rounded-2 border mb-2 cursor-pointer transition-all ${
                      formData.applicableProducts.length === 0 ? 'bg-success bg-opacity-10 border-success shadow-sm' : 'bg-light border-gray'
                    }`}
                    onClick={handleToggleAllProducts}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className={`d-flex align-items-center justify-content-center rounded-2 transition-all flex-shrink-0 ${
                            formData.applicableProducts.length === 0 ? 'bg-success text-white border-success' : 'bg-white border text-transparent'
                          }`}
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: formData.applicableProducts.length === 0 ? '2px solid #10b981' : '2px solid #cbd5e1',
                            backgroundColor: formData.applicableProducts.length === 0 ? '#10b981' : '#ffffff'
                          }}
                        >
                          <Check size={14} strokeWidth={3.5} color={formData.applicableProducts.length === 0 ? '#ffffff' : 'transparent'} />
                        </div>
                        <span className={`fs-7 ${formData.applicableProducts.length === 0 ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`}>
                          All Products (Storewide Coupon)
                        </span>
                      </div>
                      <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25 fs-9 fw-bold px-2 py-1">
                        STOREWIDE
                      </span>
                    </div>
                  </div>

                  {/* Individual Products Checkbox List */}
                  <div className="d-flex flex-column gap-1.5 p-1" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {products.map(product => {
                      const isChecked = formData.applicableProducts.length === 0 || formData.applicableProducts.includes(product._id);
                      return (
                        <div 
                          key={product._id} 
                          className={`d-flex align-items-center justify-content-between p-2.5 rounded-2 border cursor-pointer transition-all ${
                            isChecked ? 'bg-primary bg-opacity-10 border-primary-subtle' : 'bg-white border-light-subtle hover-bg-light'
                          }`}
                          onClick={() => handleToggleProduct(product._id)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div 
                              className={`d-flex align-items-center justify-content-center rounded-2 transition-all flex-shrink-0 ${
                                isChecked ? 'bg-primary text-white border-primary' : 'bg-white border text-transparent'
                              }`}
                              style={{ 
                                width: '18px', 
                                height: '18px', 
                                border: isChecked ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                                backgroundColor: isChecked ? '#3b82f6' : '#ffffff'
                              }}
                            >
                              <Check size={12} strokeWidth={3.5} color={isChecked ? '#ffffff' : 'transparent'} />
                            </div>
                            <span className={`fs-7 ${isChecked ? 'fw-bold text-dark' : 'fw-medium text-secondary'}`}>
                              {product.name}
                            </span>
                          </div>
                          <span className="fs-8 fw-bold text-muted ms-2">₹{product.price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                      <th className="fw-semibold rounded-end text-end">Actions</th>
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
                            <span className="text-muted fst-italic">All Products (Storewide)</span>
                          )}
                        </td>
                        <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end align-items-center">
                            <button 
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2.5 fs-8 fw-semibold"
                              onClick={() => openAnalyticsModal(coupon)}
                              title="View Usage Analytics"
                            >
                              <BarChart2 size={14} /> View Usage
                            </button>
                            <button 
                              className="btn btn-sm btn-light text-danger hover-light-red"
                              onClick={() => handleDelete(coupon._id)}
                              title="Delete Coupon"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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

      {/* Advanced Coupon Analytics Modal */}
      {selectedCoupon && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} onClick={closeAnalyticsModal}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow-lg">
              
              {/* Modal Header */}
              <div className="modal-header border-bottom py-3 bg-light rounded-top-4">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="modal-title fw-bold m-0 font-monospace text-dark">
                      Coupon Usage Analytics — <span className="text-brand">{selectedCoupon.code}</span>
                    </h5>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 fs-8">
                      {selectedCoupon.discountPercentage}% OFF
                    </span>
                  </div>
                  <p className="text-muted fs-8 m-0 mt-1">
                    Real-time aggregated metrics computed dynamically from orders database.
                  </p>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <button 
                    onClick={exportAnalyticsCSV} 
                    disabled={!analyticsData || analyticsLoading}
                    className="btn btn-sm btn-dark d-flex align-items-center gap-1 py-1.5 px-3 fw-semibold shadow-sm"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                  <button type="button" onClick={closeAnalyticsModal} className="btn-close"></button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 bg-light bg-opacity-25" style={{ minHeight: '65vh' }}>
                
                {/* Preset Filters & Range Bar */}
                <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    
                    {/* Quick Preset Buttons */}
                    <div className="d-flex align-items-center gap-1 flex-wrap">
                      <span className="text-muted fs-8 fw-bold text-uppercase me-2 d-flex align-items-center gap-1">
                        <Filter size={14} /> Timeline:
                      </span>
                      {[
                        { label: 'All Time', key: 'all' },
                        { label: 'Today', key: 'today' },
                        { label: 'Yesterday', key: 'yesterday' },
                        { label: '7 Days', key: '7days' },
                        { label: '30 Days', key: '30days' },
                        { label: 'This Month', key: 'thisMonth' },
                        { label: 'Last Month', key: 'lastMonth' },
                        { label: 'This Year', key: 'thisYear' },
                        { label: 'Custom', key: 'custom' },
                      ].map(p => (
                        <button
                          key={p.key}
                          onClick={() => handleFilterChange(p.key)}
                          className={`btn btn-sm py-1 px-2.5 fs-8 fw-semibold rounded-pill ${preset === p.key ? 'btn-brand' : 'btn-outline-secondary'}`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="form-check form-switch m-0 fs-8">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="includeCancelledCheck"
                          checked={includeCancelled}
                          onChange={handleToggleCancelled}
                        />
                        <label className="form-check-label fw-semibold text-dark cursor-pointer" htmlFor="includeCancelledCheck">
                          Include Cancelled
                        </label>
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        <span className="fs-8 text-muted fw-bold">Grouping:</span>
                        <select 
                          className="form-select form-select-sm fs-8 border bg-light py-1 px-2"
                          value={groupBy}
                          onChange={(e) => handleGroupByChange(e.target.value)}
                        >
                          <option value="day">Daily</option>
                          <option value="week">Weekly</option>
                          <option value="month">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Custom Date Inputs if Custom Selected */}
                  {preset === 'custom' && (
                    <div className="d-flex align-items-center gap-3 mt-3 pt-3 border-top flex-wrap">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-8 fw-semibold text-muted">From:</span>
                        <input 
                          type="date" 
                          className="form-control form-control-sm py-1 fs-8"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-8 fw-semibold text-muted">To:</span>
                        <input 
                          type="date" 
                          className="form-control form-control-sm py-1 fs-8"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={handleApplyCustomDates}
                        className="btn btn-sm btn-brand py-1 px-3 fs-8 fw-semibold"
                      >
                        Apply Range
                      </button>
                    </div>
                  )}
                </div>

                {analyticsLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-brand mb-3" role="status">
                      <span className="visually-hidden">Calculating analytics...</span>
                    </div>
                    <p className="text-muted fs-7">Running aggregation pipelines across database...</p>
                  </div>
                ) : !analyticsData ? (
                  <div className="alert alert-warning text-center py-4">Loading coupon metrics...</div>
                ) : (
                  <>
                    {/* Zero State Alert Banner if 0 uses */}
                    {analyticsData.summary?.totalUses === 0 && (
                      <div className="alert alert-info border-info d-flex align-items-start gap-3 rounded-4 p-3 mb-4 shadow-sm bg-white">
                        <Info size={24} className="text-info mt-1 flex-shrink-0" />
                        <div>
                          <h6 className="fw-bold text-dark mb-1">0 Redemptions Recorded Yet for Code "{selectedCoupon.code}"</h6>
                          <p className="text-muted fs-7 m-0">
                            No completed customer orders have used coupon code <strong>{selectedCoupon.code}</strong> for the selected date range. As customers apply this code during checkout, real-time analytics for <strong>Areas, Pincodes, Cities, States, and Top Customers</strong> will automatically populate here.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* KPI Stat Cards */}
                    <div className="row g-3 mb-4">
                      <div className="col-md-3 col-6">
                        <div className="p-3 bg-white border rounded-4 shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fs-8 text-muted fw-bold text-uppercase">Total Uses</span>
                            <span className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                              <Tag size={16} />
                            </span>
                          </div>
                          <h3 className="fw-bold text-dark m-0 display-font">{(analyticsData.summary?.totalUses || 0).toLocaleString()}</h3>
                          <small className="text-muted fs-8">Orders applied</small>
                        </div>
                      </div>

                      <div className="col-md-3 col-6">
                        <div className="p-3 bg-white border rounded-4 shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fs-8 text-muted fw-bold text-uppercase">Total Discount Given</span>
                            <span className="p-2 rounded-circle bg-success bg-opacity-10 text-success">
                              <TrendingUp size={16} />
                            </span>
                          </div>
                          <h3 className="fw-bold text-success m-0 display-font">₹{(analyticsData.summary?.totalDiscountGiven || 0).toLocaleString()}</h3>
                          <small className="text-muted fs-8">Savings granted</small>
                        </div>
                      </div>

                      <div className="col-md-3 col-6">
                        <div className="p-3 bg-white border rounded-4 shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fs-8 text-muted fw-bold text-uppercase">Total Revenue</span>
                            <span className="p-2 rounded-circle bg-info bg-opacity-10 text-info">
                              <DollarSign size={16} />
                            </span>
                          </div>
                          <h3 className="fw-bold text-info m-0 display-font">₹{(analyticsData.summary?.totalRevenueGenerated || 0).toLocaleString()}</h3>
                          <small className="text-muted fs-8">Order gross total</small>
                        </div>
                      </div>

                      <div className="col-md-3 col-6">
                        <div className="p-3 bg-white border rounded-4 shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fs-8 text-muted fw-bold text-uppercase">Avg Order Value</span>
                            <span className="p-2 rounded-circle bg-warning bg-opacity-10 text-warning">
                              <ShoppingBag size={16} />
                            </span>
                          </div>
                          <h3 className="fw-bold text-dark m-0 display-font">₹{(analyticsData.summary?.avgOrderValue || 0).toLocaleString()}</h3>
                          <small className="text-muted fs-8">AOV per coupon order</small>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <ul className="nav nav-tabs border-bottom mb-4">
                      <li className="nav-item">
                        <button 
                          className={`nav-link fw-bold fs-7 ${activeTab === 'geographics' ? 'active text-brand border-bottom-brand' : 'text-muted'}`}
                          onClick={() => setActiveTab('geographics')}
                        >
                          <MapPin size={15} className="me-1" /> Area & Geographic Usage (Pincodes / Localities / Cities / States)
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link fw-semibold fs-7 ${activeTab === 'overview' ? 'active text-brand border-bottom-brand' : 'text-muted'}`}
                          onClick={() => setActiveTab('overview')}
                        >
                          Usage Timeline
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link fw-semibold fs-7 ${activeTab === 'customers' ? 'active text-brand border-bottom-brand' : 'text-muted'}`}
                          onClick={() => setActiveTab('customers')}
                        >
                          Top Customers
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link fw-semibold fs-7 ${activeTab === 'status' ? 'active text-brand border-bottom-brand' : 'text-muted'}`}
                          onClick={() => setActiveTab('status')}
                        >
                          Order Status Breakdown
                        </button>
                      </li>
                      <li className="nav-item">
                        <button 
                          className={`nav-link fw-semibold fs-7 ${activeTab === 'recent' ? 'active text-brand border-bottom-brand' : 'text-muted'}`}
                          onClick={() => setActiveTab('recent')}
                        >
                          Recent Transactions
                        </button>
                      </li>
                    </ul>

                    {/* TAB: Area & Geographics (Pincode, Area/Locality, City, State) */}
                    {activeTab === 'geographics' && (
                      <div className="row g-4">
                        {/* Area / Locality Wise */}
                        <div className="col-md-6 col-lg-3">
                          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1 fs-7">
                              <MapPin size={16} className="text-danger" /> Area / Locality Usage
                            </h6>
                            {!analyticsData.geographics?.areas || analyticsData.geographics.areas.length === 0 ? (
                              <p className="text-muted fs-8 text-center py-4">No area data recorded</p>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-sm align-middle fs-8">
                                  <thead>
                                    <tr className="text-muted">
                                      <th>Area / Locality</th>
                                      <th className="text-end">Uses</th>
                                      <th className="text-end">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analyticsData.geographics.areas.map((ar, i) => (
                                      <tr key={i}>
                                        <td className="fw-semibold text-dark text-truncate" style={{ maxWidth: '120px' }}>{ar.area}</td>
                                        <td className="text-end fw-bold">{ar.uses}</td>
                                        <td className="text-end text-muted">₹{ar.revenue}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pincode Wise */}
                        <div className="col-md-6 col-lg-3">
                          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1 fs-7">
                              <MapPin size={16} className="text-warning" /> Pincode Wise Usage
                            </h6>
                            {!analyticsData.geographics?.pincodes || analyticsData.geographics.pincodes.length === 0 ? (
                              <p className="text-muted fs-8 text-center py-4">No pincode data recorded</p>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-sm align-middle fs-8">
                                  <thead>
                                    <tr className="text-muted">
                                      <th>Pincode</th>
                                      <th className="text-end">Uses</th>
                                      <th className="text-end">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analyticsData.geographics.pincodes.map((pin, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold font-monospace text-dark">{pin.pincode}</td>
                                        <td className="text-end fw-bold">{pin.uses}</td>
                                        <td className="text-end text-muted">₹{pin.revenue}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* City Wise */}
                        <div className="col-md-6 col-lg-3">
                          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1 fs-7">
                              <MapPin size={16} className="text-info" /> City Wise Usage
                            </h6>
                            {!analyticsData.geographics?.cities || analyticsData.geographics.cities.length === 0 ? (
                              <p className="text-muted fs-8 text-center py-4">No city data recorded</p>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-sm align-middle fs-8">
                                  <thead>
                                    <tr className="text-muted">
                                      <th>City</th>
                                      <th className="text-end">Uses</th>
                                      <th className="text-end">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analyticsData.geographics.cities.map((ct, i) => (
                                      <tr key={i}>
                                        <td className="fw-semibold text-dark">{ct.city}</td>
                                        <td className="text-end fw-bold">{ct.uses}</td>
                                        <td className="text-end text-muted">₹{ct.revenue}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* State Wise */}
                        <div className="col-md-6 col-lg-3">
                          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1 fs-7">
                              <MapPin size={16} className="text-brand" /> State Wise Usage
                            </h6>
                            {!analyticsData.geographics?.states || analyticsData.geographics.states.length === 0 ? (
                              <p className="text-muted fs-8 text-center py-4">No state data recorded</p>
                            ) : (
                              <div className="table-responsive">
                                <table className="table table-sm align-middle fs-8">
                                  <thead>
                                    <tr className="text-muted">
                                      <th>State</th>
                                      <th className="text-end">Uses</th>
                                      <th className="text-end">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {analyticsData.geographics.states.map((st, i) => (
                                      <tr key={i}>
                                        <td className="fw-semibold text-dark">{st.state}</td>
                                        <td className="text-end fw-bold">{st.uses}</td>
                                        <td className="text-end text-muted">₹{st.revenue}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: Timeline */}
                    {activeTab === 'overview' && (
                      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Usage Timeline Breakdown</h6>
                        {!analyticsData.timeline || analyticsData.timeline.length === 0 ? (
                          <p className="text-muted fs-7 text-center py-4">No coupon usage recorded for the selected timeline.</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle fs-7">
                              <thead className="table-light">
                                <tr>
                                  <th>Date / Period</th>
                                  <th>Number of Uses</th>
                                  <th>Discount Given (₹)</th>
                                  <th>Revenue Generated (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.timeline.map((row, idx) => (
                                  <tr key={idx}>
                                    <td className="fw-bold font-monospace">{row.date}</td>
                                    <td><span className="badge bg-light text-dark border px-2 py-1 fw-bold">{row.uses} Uses</span></td>
                                    <td className="text-success fw-bold">₹{row.discountAmount.toLocaleString()}</td>
                                    <td className="fw-bold text-dark">₹{row.revenueGenerated.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Top Customers */}
                    {activeTab === 'customers' && (
                      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <Users size={18} className="text-brand" /> Top Coupon Redeemers
                        </h6>
                        {!analyticsData.topCustomers || analyticsData.topCustomers.length === 0 ? (
                          <p className="text-muted fs-7 text-center py-4">No customer usage data available.</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle fs-7">
                              <thead className="table-light">
                                <tr>
                                  <th>Customer Name</th>
                                  <th>Email</th>
                                  <th>Phone</th>
                                  <th>Times Used</th>
                                  <th>Total Savings (₹)</th>
                                  <th>Total Spent (₹)</th>
                                  <th>Last Used Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.topCustomers.map((cust, i) => (
                                  <tr key={i}>
                                    <td className="fw-bold text-dark">{cust.name}</td>
                                    <td className="text-muted">{cust.email}</td>
                                    <td className="text-muted">{cust.phone}</td>
                                    <td><span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 fw-bold">{cust.timesUsed} Times</span></td>
                                    <td className="text-success fw-bold">₹{cust.totalDiscountReceived.toLocaleString()}</td>
                                    <td className="fw-bold text-dark">₹{cust.totalAmountSpent.toLocaleString()}</td>
                                    <td className="text-muted fs-8">{new Date(cust.lastUsed).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: Order Status Breakdown */}
                    {activeTab === 'status' && (
                      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Order Status Distribution</h6>
                        <div className="row g-3">
                          {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(st => {
                            const count = (analyticsData.statusDistribution && analyticsData.statusDistribution[st]) || 0;
                            return (
                              <div key={st} className="col-md-4 col-6">
                                <div className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                                  <span className="fw-semibold text-muted">{st}</span>
                                  <span className={`badge ${st === 'Delivered' ? 'bg-success' : st === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'} fs-7 px-3 py-1.5`}>
                                    {count} Orders
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* TAB: Recent Transactions */}
                    {activeTab === 'recent' && (
                      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                        <h6 className="fw-bold text-dark mb-3">Recent Coupon Transactions</h6>
                        {!analyticsData.recentActivity || analyticsData.recentActivity.length === 0 ? (
                          <p className="text-muted fs-7 text-center py-4">No recent activity found.</p>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover align-middle fs-7">
                              <thead className="table-light">
                                <tr>
                                  <th>Order ID</th>
                                  <th>Customer</th>
                                  <th>Date</th>
                                  <th>Discount (₹)</th>
                                  <th>Order Total (₹)</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData.recentActivity.map((ord) => (
                                  <tr key={ord._id}>
                                    <td className="fw-bold font-monospace">#{ord._id.substring(0, 10).toUpperCase()}</td>
                                    <td>
                                      <div>
                                        <span className="fw-bold text-dark d-block">{ord.deliveryAddress?.name || ord.user?.name || 'Guest'}</span>
                                        <small className="text-muted">{ord.user?.email || 'N/A'}</small>
                                      </div>
                                    </td>
                                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                    <td className="text-success fw-bold">₹{ord.couponDiscount}</td>
                                    <td className="fw-bold text-dark">₹{ord.totalAmount}</td>
                                    <td>
                                      <span className={ord.orderStatus === 'Delivered' ? 'badge bg-success' : ord.orderStatus === 'Cancelled' ? 'badge bg-danger' : 'badge bg-warning text-dark'}>
                                        {ord.orderStatus}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer border-top py-2 bg-light rounded-bottom-4">
                <button type="button" onClick={closeAnalyticsModal} className="btn btn-sm btn-secondary px-4 fw-semibold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
