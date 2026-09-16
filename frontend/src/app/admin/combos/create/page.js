'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Plus, Trash2, Search, X, UploadCloud, Gift, Star, Check, Package } from 'lucide-react';
import api from '../../../../utils/axiosConfig';
import { useNotification } from '../../../../context/NotificationContext';
import { createPortal } from 'react-dom';
import { getImageUrl } from '../../../../utils/imageConfig';

export default function AdminComboCreatePage() {
  const router = useRouter();
  const { showAlert } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benefits: '',
    shortDescription: '',
    sku: '',
    category: 'Combo',
    brand: 'MaxGlow',
    comboPrice: '',
    status: 'Draft',
    isFeatured: false,
    sortOrder: 0,
    image: '',
    images: [],
    components: []
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Product Search Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleSearch = async (query = searchQuery) => {
    try {
      setSearching(true);
      const res = await api.get('/products?limit=100&search=' + encodeURIComponent(query));
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      showAlert('Failed to load products', 'danger');
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Multiple Image Upload Handler (Supports single or multiple files)
  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert(`Image "${file.name}" is too large (max 5MB)`, 'warning');
        return;
      }
    }

    try {
      setUploading(true);
      const uploadPromises = files.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await api.post('/uploads', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.success && res.data.url ? res.data.url : null;
      });

      const results = await Promise.all(uploadPromises);
      const newUrls = results.filter(Boolean);

      if (newUrls.length > 0) {
        setFormData(prev => {
          const prevImages = prev.images && Array.isArray(prev.images) && prev.images.length > 0 
            ? [...prev.images] 
            : (prev.image ? [prev.image] : []);
          const merged = [...prevImages, ...newUrls];
          const uniqueImages = Array.from(new Set(merged));
          const primaryImg = (uniqueImages.includes(prev.image)) ? prev.image : (uniqueImages[0] || '');
          return {
            ...prev,
            image: primaryImg,
            images: uniqueImages
          };
        });
        showAlert(`${newUrls.length} image(s) uploaded successfully`, 'success');
      }
    } catch (error) {
      showAlert('Image upload failed', 'danger');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const prevImages = prev.images && Array.isArray(prev.images) && prev.images.length > 0 
        ? [...prev.images] 
        : (prev.image ? [prev.image] : []);
      const removedUrl = prevImages[indexToRemove];
      const updatedImages = prevImages.filter((_, i) => i !== indexToRemove);
      let newPrimary = prev.image;
      if (prev.image === removedUrl || !updatedImages.includes(prev.image)) {
        newPrimary = updatedImages[0] || '';
      }
      return {
        ...prev,
        image: newPrimary,
        images: updatedImages
      };
    });
  };

  const setPrimaryImage = (imgUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imgUrl
    }));
    showAlert('Set as primary cover image', 'info');
  };

  const addComponent = (product) => {
    const defaultSize = product.packSizes?.length > 0 ? `${product.packSizes[0].weight} ${product.packSizes[0].unit}` : (product.unit ? `${product.unitValue || 1} ${product.unit}` : 'Standard');
    
    setFormData(prev => {
      const exists = prev.components.find(c => String(c.product) === String(product._id) && c.size === defaultSize);
      if (exists) {
        const updated = prev.components.map(c => {
          if (String(c.product) === String(product._id) && c.size === defaultSize) {
            return { ...c, quantity: c.quantity + 1 };
          }
          return c;
        });
        showAlert(`Incremented ${product.name} quantity to ${exists.quantity + 1}`, 'success');
        return { ...prev, components: updated };
      }

      const newComponent = {
        product: product._id,
        name: product.name,
        size: defaultSize,
        quantity: 1,
        label: '',
        _productData: product
      };

      showAlert(`${product.name} added to combo`, 'success');
      return { ...prev, components: [...prev.components, newComponent] };
    });
  };

  const updateComponent = (index, field, value) => {
    setFormData(prev => {
      const newComponents = [...prev.components];
      newComponents[index][field] = value;
      return { ...prev, components: newComponents };
    });
  };

  const removeComponent = (index) => {
    setFormData(prev => {
      const newComponents = prev.components.filter((_, i) => i !== index);
      return { ...prev, components: newComponents };
    });
  };

  const calculateRegularTotal = () => {
    let total = 0;
    formData.components.forEach(comp => {
      const p = comp._productData;
      if (!p) return;
      let basePrice = p.price || 0;
      if (p.packSizes?.length > 0) {
        const pack = p.packSizes.find(s => `${s.weight} ${s.unit}` === comp.size);
        if (pack) basePrice = pack.price;
      }
      total += basePrice * comp.quantity;
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.components.length === 0) {
      showAlert('Please add at least one product to the combo.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const imagesList = formData.images && Array.isArray(formData.images) && formData.images.length > 0 
        ? formData.images 
        : (formData.image ? [formData.image] : []);
      const primaryImg = (imagesList.includes(formData.image)) ? formData.image : (imagesList[0] || '');

      const payload = {
        ...formData,
        image: primaryImg,
        images: imagesList,
        components: formData.components.map(c => ({
          product: c.product,
          name: c.name,
          size: c.size,
          quantity: c.quantity,
          label: c.label
        }))
      };

      const res = await api.post('/combos/admin', payload);
      if (res.data.success) {
        showAlert('Combo created successfully', 'success');
        router.push('/admin/combos');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to create combo', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const regularTotal = calculateRegularTotal();
  const savings = Math.max(0, regularTotal - (Number(formData.comboPrice) || 0));
  const currentImages = formData.images && Array.isArray(formData.images) && formData.images.length > 0 
    ? formData.images 
    : (formData.image ? [formData.image] : []);
  const primaryCover = (currentImages.includes(formData.image)) ? formData.image : (currentImages[0] || '');

  return (
    <div className="admin-page animate__animated animate__fadeIn pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-3">
          <Link href="/admin/combos" className="btn btn-sm btn-outline-secondary rounded-circle p-2" title="Back">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="fw-bold m-0" style={{ color: '#162C18' }}>Create Combo</h2>
            <p className="text-muted m-0">Build a new bundled product offering with multiple optional images.</p>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn btn-brand d-flex align-items-center gap-2">
          {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
          Save Combo
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Form Details */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Basic Information</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold fs-7">Combo Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold fs-7">SKU</label>
                  <input type="text" className="form-control" name="sku" value={formData.sku} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold fs-7">Description <span className="text-danger">*</span></label>
                  <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange} required></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label fw-bold fs-7">Benefits</label>
                  <textarea className="form-control" name="benefits" rows="3" value={formData.benefits || ''} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="m-0 fw-bold">Combo Components</h5>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="card-body p-0">
              {formData.components.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <div className="mb-3"><Gift size={48} className="opacity-25" /></div>
                  <h6>No products added yet</h6>
                  <p className="fs-7">Click the "Add Product" button to build this combo.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle m-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th width="150">Price</th>
                        <th width="120">Qty</th>
                        <th width="160">Label (Opt)</th>
                        <th width="60"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.components.map((comp, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="fw-bold">{comp.name}</div>
                            <div className="text-muted fs-8">Size: {comp.size}</div>
                          </td>
                          <td>
                            ₹{comp._productData?.price || 0}
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="form-control form-control-sm text-center" 
                              min="1" 
                              value={comp.quantity} 
                              onChange={(e) => updateComponent(idx, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value={comp.label || ''} 
                              onChange={(e) => updateComponent(idx, 'label', e.target.value)}
                            />
                          </td>
                          <td>
                            <button 
                              onClick={() => removeComponent(idx)} 
                              className="btn btn-sm btn-outline-danger border-0 p-1"
                              title="Remove"
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

        {/* Right Column: Pricing, Multi-Image Upload, Status */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Pricing</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3 d-flex justify-content-between text-muted fs-7 border-bottom pb-2">
                <span>Regular Total:</span>
                <span className="fw-bold">₹{regularTotal}</span>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold fs-7 text-primary">Combo Selling Price (₹) <span className="text-danger">*</span></label>
                <input 
                  type="number" 
                  className="form-control form-control-lg border-primary" 
                  name="comboPrice" 
                  value={formData.comboPrice} 
                  onChange={handleChange} 
                  required 
                  min="0"
                />
              </div>
              {formData.comboPrice && regularTotal > 0 && (
                <div className={`p-3 rounded-3 text-center ${savings > 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning-dark'}`}>
                  {savings > 0 ? (
                    <>
                      <div className="fw-bold fs-5">Save ₹{savings}</div>
                      <div className="fs-8">({Math.round((savings / regularTotal) * 100)}% Discount)</div>
                    </>
                  ) : (
                    <div className="fw-bold fs-6">No Discount Applied</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Multi-Image Upload Section (Optional Multiple Images) */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0 fw-bold">Combo Images</h5>
                <span className="text-muted fs-8">Multiple images supported (Optional)</span>
              </div>
              {currentImages.length > 0 && (
                <span className="badge bg-light text-dark border">{currentImages.length} Image{currentImages.length > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="card-body p-4">
              {currentImages.length > 0 ? (
                <div>
                  {/* Primary Cover Image Preview */}
                  <div className="position-relative mb-3 rounded-3 overflow-hidden border" style={{ width: '100%', aspectRatio: '16/9', background: '#f8fafc' }}>
                    <Image 
                      src={getImageUrl(primaryCover)} 
                      alt="Primary Combo Cover" 
                      fill 
                      style={{ objectFit: 'contain', padding: '8px' }} 
                    />
                    <div className="position-absolute top-0 start-0 m-2 badge bg-success d-flex align-items-center gap-1 shadow-sm">
                      <Star size={12} fill="white" /> Primary Cover
                    </div>
                  </div>

                  {/* Thumbnail Gallery List */}
                  <div className="d-flex gap-2 flex-wrap mb-3">
                    {currentImages.map((imgUrl, idx) => {
                      const isPrimary = (imgUrl === primaryCover);
                      return (
                        <div 
                          key={idx} 
                          className={`position-relative rounded-3 overflow-hidden border ${isPrimary ? 'border-success border-2 shadow-sm' : 'border-secondary border-opacity-25'}`}
                          style={{ width: '68px', height: '68px', background: '#fff', cursor: 'pointer' }}
                          onClick={() => setPrimaryImage(imgUrl)}
                        >
                          <Image 
                            src={getImageUrl(imgUrl)} 
                            alt={`Combo image ${idx + 1}`} 
                            fill 
                            style={{ objectFit: 'cover' }} 
                          />
                          {isPrimary && (
                            <span 
                              className="position-absolute bottom-0 start-0 m-1 badge bg-success p-1 rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '16px', height: '16px', zIndex: 4 }}
                              title="Primary Cover"
                            >
                              <Star size={10} fill="white" />
                            </span>
                          )}
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="btn btn-sm btn-danger position-absolute p-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{ top: '2px', right: '2px', width: '20px', height: '20px', zIndex: 5 }}
                            title="Delete image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-4 border border-dashed rounded-3 bg-light text-center text-muted">
                  <UploadCloud size={36} className="mb-2 text-secondary opacity-50" />
                  <div className="fw-semibold fs-7 text-dark">No combo images uploaded yet</div>
                  <div className="fs-8 text-muted">Upload 1 or more banner/cover images (Optional)</div>
                </div>
              )}
              
              <div>
                <input 
                  type="file" 
                  id="comboMultiImages" 
                  className="d-none" 
                  accept="image/*" 
                  multiple
                  onChange={handleImagesUpload}
                  disabled={uploading}
                />
                <label htmlFor="comboMultiImages" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2" style={{ cursor: 'pointer' }}>
                  {uploading ? <span className="spinner-border spinner-border-sm" /> : <UploadCloud size={16} />}
                  {uploading ? 'Uploading...' : (currentImages.length > 0 ? 'Upload More Images' : 'Choose Image(s)')}
                </label>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-white border-bottom py-3">
              <h5 className="m-0 fw-bold">Publishing</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-3">
                <label className="form-label fw-bold fs-7">Status</label>
                <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold fs-7">Sort Order</label>
                <input type="number" className="form-control" name="sortOrder" value={formData.sortOrder} onChange={handleChange} />
              </div>
              <div className="form-check form-switch mt-4">
                <input className="form-check-input" type="checkbox" role="switch" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                <label className="form-check-label fw-bold fs-7" htmlFor="isFeatured">Featured Combo</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Product Search & Add Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1050, backdropFilter: 'blur(6px)', padding: '16px' }} 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="card shadow-2-strong border-0 rounded-4" 
            style={{ width: '740px', maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light bg-opacity-50">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DDF7E3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#3BAE56" />
                </div>
                <div>
                  <h5 className="fw-bold m-0" style={{ color: '#1a2332', fontSize: '17px' }}>Add Product to Combo</h5>
                  <span className="text-muted" style={{ fontSize: '12px' }}>Search and select products to include in this bundle</span>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-light border rounded-circle p-1 d-flex align-items-center justify-content-center" 
                onClick={() => setIsModalOpen(false)}
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} className="text-muted" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-bottom bg-white">
              <label className="form-label fw-semibold text-secondary mb-1" style={{ fontSize: '12px' }}>Search Products by Name or SKU</label>
              <div className="d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Search size={16} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                  />
                  {searchQuery && (
                    <button 
                      className="btn btn-outline-secondary border-start-0 border-end-0" 
                      type="button" 
                      onClick={() => { setSearchQuery(''); handleSearch(''); }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button 
                  className="btn btn-success d-flex align-items-center gap-1 px-3" 
                  onClick={() => handleSearch(searchQuery)} 
                  disabled={searching}
                  style={{ backgroundColor: '#3BAE56', borderColor: '#3BAE56', fontWeight: '600' }}
                >
                  {searching ? <span className="spinner-border spinner-border-sm" /> : <Search size={15} />}
                  <span>Search</span>
                </button>
              </div>
            </div>
            
            {/* Scrollable Products List */}
            <div className="p-3" style={{ overflowY: 'auto', maxHeight: '420px' }}>
              {searching ? (
                <div className="p-5 text-center text-muted">
                  <div className="spinner-border spinner-border-sm text-success mb-2" role="status" />
                  <div>Loading products...</div>
                </div>
              ) : products.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <Package size={40} className="mb-2 opacity-25" />
                  <div className="fw-semibold">No products found</div>
                  <div className="fs-8">Try searching with a different product name or SKU.</div>
                </div>
              ) : (
                <div className="d-flex flexDirection-column gap-2" style={{ display: 'flex', flexDirection: 'column' }}>
                  {products.map(product => {
                    const isAdded = formData.components.some(c => String(c.product) === String(product._id));
                    const stock = product.stock || 0;
                    const isOutOfStock = stock <= 0;
                    const isLowStock = stock > 0 && stock <= 10;
                    const prodImg = product.images?.[0] || product.image || '/top_product1.png';

                    return (
                      <div 
                        key={product._id} 
                        className="d-flex justify-content-between align-items-center p-2 px-3 rounded-3 border transition-all"
                        style={{ 
                          background: isAdded ? '#F7FBFD' : '#ffffff',
                          borderColor: isAdded ? '#3BAE56' : '#e2e8f0',
                        }}
                      >
                        <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                          <div style={{ width: '46px', height: '46px', position: 'relative', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                            <Image 
                              src={getImageUrl(prodImg)} 
                              alt={product.name} 
                              fill 
                              style={{ objectFit: 'cover' }} 
                              sizes="46px" 
                            />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="fw-bold text-truncate" style={{ color: '#1a2332', fontSize: '13.5px', maxWidth: '380px' }}>
                              {product.name}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#3BAE56' }}>
                                ₹{product.price}
                              </span>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span 
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  backgroundColor: isOutOfStock ? '#fee2e2' : (isLowStock ? '#fef3c7' : '#dcfce7'),
                                  color: isOutOfStock ? '#991b1b' : (isLowStock ? '#b45309' : '#166534')
                                }}
                              >
                                {isOutOfStock ? 'Out of Stock' : (isLowStock ? `Low Stock (${stock})` : `In Stock (${stock})`)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                          <button 
                            type="button"
                            className={`btn btn-sm d-flex align-items-center gap-1 ${isAdded ? 'btn-success text-white' : 'btn-outline-success'}`}
                            onClick={() => addComponent(product)}
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              backgroundColor: isAdded ? '#3BAE56' : 'transparent',
                              borderColor: '#3BAE56',
                              color: isAdded ? '#ffffff' : '#3BAE56'
                            }}
                          >
                            {isAdded ? <Check size={14} /> : <Plus size={14} />}
                            {isAdded ? 'Add More' : 'Add to Combo'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="d-flex justify-content-between align-items-center p-3 px-4 border-top bg-light bg-opacity-50">
              <span className="text-muted" style={{ fontSize: '12.5px' }}>
                {formData.components.length} product(s) added to this combo
              </span>
              <button 
                className="btn btn-secondary btn-sm px-4 fw-semibold" 
                onClick={() => setIsModalOpen(false)}
                style={{ borderRadius: '8px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
