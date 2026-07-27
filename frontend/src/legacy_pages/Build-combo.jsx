"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import Image from 'next/image';


import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/productsSlice';
import { addToCart } from '@/store/cartSlice';


import { useNotification } from '@/context/NotificationContext';

export default function BuildComboPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading combo builder...</div>}>
      <BuildComboContent />
    </Suspense>
  );
}

function BuildComboContent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items: products, loading } = useSelector((state) => state.products);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const { showAlert } = useNotification();

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const toggleProductSelection = (productId) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddComboToCart = () => {
    if (selectedProductIds.length < 2) {
      showAlert('Please select at least 2 products to create a combo.', 'warning');
      return;
    }

    const selectedProducts = products.filter(p => selectedProductIds.includes(p._id));
    
    selectedProducts.forEach(product => {
      dispatch(addToCart({
        product,
        quantity: 1,
        size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
      }));
    });

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  // Calculate Combo Subtotal
  const comboSubtotal = selectedProductIds.reduce((total, id) => {
    const p = products.find(prod => prod._id === id);
    if (!p) return total;
    const activePrice = p.discountedPrice || (p.discount > 0 ? (p.discountType === 'Flat' ? Math.max(0, p.price - p.discount) : Math.max(0, p.price - (p.price * p.discount / 100))) : p.price);
    return total + activePrice;
  }, 0);

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-4" style={{ fontSize: '13px' }}>
          <li className="breadcrumb-item"><Link href="/" className="text-muted">Home</Link></li>
          <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Build Your Own Combo</li>
        </ol>
      </nav>

      <div className="mb-4 text-center">
        <h2 className="main-title mb-2" style={{ color: '#203d74' }}>Build Your Own Custom Combo</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>Select your favorite products to create a personalized gift box. Apply our special Combo Coupons at checkout to get amazing discounts!</p>
      </div>

      <div className="row g-4">
        {/* Left Side: Product Grid */}
        <div className="col-lg-8">
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-light w-100 rounded mb-2" style={{ height: '260px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4" id="shopProductGrid">
              {products.map((product) => {
                const isSelected = selectedProductIds.includes(product._id);
                const activePrice = product.discountedPrice || (product.discount > 0 ? (product.discountType === 'Flat' ? Math.max(0, product.price - product.discount) : Math.max(0, product.price - (product.price * product.discount / 100))) : product.price);
                const mrp = product.price;
                
                let image = '/placeholder.png';
                if (product.images && product.images.length > 0) {
                  image = product.images[0].replace('/assets/images/', '/');
                } else if (product.image) {
                  image = product.image.replace('/assets/images/', '/');
                }
                
                const tagLeft = product.newArrival ? 'NEW ARRIVAL' : (product.tagLeft || (product.discount > 0 ? 'PREMIUM' : ''));
                const tagLeftClass = product.newArrival ? 'bg-success' : (product.tagLeftClass || '');
                const tagRight = product.tagRight || (product.discount > 0 ? (product.discountType === 'Flat' ? `₹${product.discount} OFF` : `${product.discount}% OFF`) : '');

                return (
                  <div key={product._id} className="col-sm-6 col-md-4">
                    <div className="item h-100 px-2 py-3" onClick={() => { if (product.stock > 0) toggleProductSelection(product._id); }} style={{ cursor: product.stock > 0 ? 'pointer' : 'not-allowed' }}>
                      <div className={`Sweettree-product-card position-relative transition-all ${isSelected ? 'border-primary shadow-sm' : ''}`} style={{ opacity: product.stock <= 0 ? 0.7 : 1 }}>
                        
                        {isSelected && (
                          <div className="position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '28px', height: '28px', zIndex: 10, backgroundColor: '#1c72b9', color: 'white' }}>
                            <i className="fas fa-check"></i>
                          </div>
                        )}

                        <div className="product-tags d-flex justify-content-between">
                          {tagLeft && <span className={`tag-left ${tagLeftClass}`}>{tagLeft}</span>}
                          {tagRight && <span className="tag-right ms-auto">{tagRight}</span>}
                        </div>
                        
                        <div style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                          <div className="product-img-box position-relative" style={{ minHeight: '200px' }}>
                            {product.stock <= 0 && (
                              <div className="position-absolute w-100 d-flex justify-content-center align-items-center" style={{ top: '40%', zIndex: 20 }}>
                                <span className="badge bg-danger px-3 py-2 fs-6 shadow-sm">OUT OF STOCK</span>
                              </div>
                            )}
                            <Image 
                              src={image} 
                              alt={product.name} 
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                          <div className="card-divider"></div>
                          
                          <div className="product-meta d-flex justify-content-between align-items-center">
                            <span className="brand-text">{product.brand || 'Sweettree'}</span>
                          </div>
                          
                          <h3 className="product-name" style={{ userSelect: 'none' }}>{product.name}</h3>
                          
                          <div className="product-pricing">
                            {mrp > activePrice ? (
                              <>
                                MRP: <del>₹{mrp}</del> <span className="current-price">₹{activePrice}</span> 
                              </>
                            ) : (
                              <span className="current-price">₹{activePrice}</span>
                            )}
                          </div>
                        </div>

                        <button 
                          className={`Sweettree-btn-cart w-100 mt-2`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (product.stock > 0) toggleProductSelection(product._id); }}
                          style={product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#6c757d', borderColor: '#6c757d' } : (isSelected ? { backgroundColor: '#1c72b9', color: 'white', borderColor: '#1c72b9' } : {})}
                          disabled={product.stock <= 0}
                        >
                          {product.stock <= 0 ? 'Out of Stock' : (isSelected ? 'Remove from Combo' : 'Select for Combo')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Combo Summary Sticky */}
        <div className="col-lg-4 d-none d-lg-block">
          <div className="shop-sidebar-filter card border-0 shadow-sm rounded-0 p-4 mb-4">
            <div className="filter-header d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '16px' }}>
                <i className="fas fa-shopping-bag me-2"></i> Combo Summary
              </h5>
            </div>
            
            <div className="d-flex justify-content-between text-muted mb-3 fs-7 border-bottom pb-2">
              <span className="fw-bold" style={{ fontSize: '14px' }}>Items Selected:</span>
              <span className="fw-bold text-dark">{selectedProductIds.length}</span>
            </div>

            <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {selectedProductIds.length === 0 ? (
                <p className="text-muted fs-8 text-center py-4 fst-italic">No products selected yet. Click on products to add them to your combo.</p>
              ) : (
                selectedProductIds.map(id => {
                  const p = products.find(prod => prod._id === id);
                  if (!p) return null;
                  const activePrice = p.discountedPrice || (p.discount > 0 ? (p.discountType === 'Flat' ? Math.max(0, p.price - p.discount) : Math.max(0, p.price - (p.price * p.discount / 100))) : p.price);
                  return (
                    <div key={id} className="d-flex justify-content-between align-items-center fs-7 bg-white p-2 rounded border-sm">
                      <span className="text-truncate me-2" style={{ maxWidth: '150px' }}>{p.name}</span>
                      <span className="fw-bold">₹{activePrice}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="d-flex justify-content-between fw-bold text-dark fs-5 mb-4 border-top pt-3">
              <span>Combo Total</span>
              <span>₹{comboSubtotal}</span>
            </div>

            <button 
              onClick={handleAddComboToCart}
              disabled={selectedProductIds.length < 2}
              className="Sweettree-btn-cart w-100 mt-3"
              style={selectedProductIds.length < 2 ? { backgroundColor: '#ccc', borderColor: '#ccc', cursor: 'not-allowed' } : {}}
            >
              {selectedProductIds.length < 2 ? 'Select at least 2 items' : 'Add Combo to Cart'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
