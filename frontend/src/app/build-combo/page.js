'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/productsSlice.js';
import { addToCart } from '../../store/cartSlice.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useNotification } from '../../context/NotificationContext';
import MgCard from '../../components/ui/MgCard';
import MgButton from '../../components/ui/MgButton';
import ProductCard from '../../components/ProductCard';

export default function BuildComboPage() {
  return (
    <Suspense fallback={<div className="text-center py-5 fs-4 text-muted">Loading combo builder...</div>}>
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
        <ol className="breadcrumb mb-4" style={{ fontSize: '0.9rem' }}>
          <li className="breadcrumb-item"><Link href="/" className="text-muted text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item active fw-bold text-dark" aria-current="page">Build Your Own Combo</li>
        </ol>
      </nav>

      <div className="mb-5 text-center">
        <span className="d-inline-block px-4 py-2 rounded-pill mb-3 fw-bold shadow-sm" style={{ backgroundColor: '#eef6ff', color: '#1c72b9', fontSize: '0.9rem', letterSpacing: '1px' }}>
          GIFTING & BUNDLES
        </span>
        <h2 className="display-5 fw-bold text-dark mb-3">Build Your Custom Combo</h2>
        <p className="text-secondary fs-5 mx-auto" style={{ maxWidth: '700px', lineHeight: '1.6' }}>
          Select your favorite products to create a personalized gift box. Apply our special Combo Coupons at checkout to unlock amazing discounts!
        </p>
      </div>

      <div className="row g-4">
        {/* Left Side: Product Grid */}
        <div className="col-lg-8">
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-light w-100 rounded-4 mb-2" style={{ height: '320px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4" id="shopProductGrid">
              {products.map((product) => {
                const isSelected = selectedProductIds.includes(product._id);
                
                return (
                  <div key={product._id} className="col-sm-6 col-md-4">
                    <ProductCard 
                      product={product}
                      isComboMode={true}
                      isSelected={isSelected}
                      onToggleSelect={() => toggleProductSelection(product._id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Combo Summary Sticky */}
        <div className="col-lg-4">
          <div className="position-sticky" style={{ top: '100px' }}>
            <MgCard className="p-4 shadow-lg border-0" style={{ backgroundColor: '#f8fafc' }}>
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light">
                <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: '40px', height: '40px', backgroundColor: '#1c72b9' }}>
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <h4 className="fw-bold m-0 text-dark">Combo Summary</h4>
              </div>
              
              <div className="d-flex justify-content-between align-items-center text-secondary mb-4 p-3 rounded-3" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
                <span className="fw-medium fs-6">Items Selected</span>
                <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{selectedProductIds.length}</span>
              </div>

              <div className="d-flex flex-column gap-3 mb-4 pe-2" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {selectedProductIds.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="fas fa-box-open fs-1 mb-3 opacity-25"></i>
                    <p className="fs-6 fst-italic m-0">No products selected yet.<br/>Click on products to add them to your combo.</p>
                  </div>
                ) : (
                  selectedProductIds.map(id => {
                    const p = products.find(prod => prod._id === id);
                    if (!p) return null;
                    const activePrice = p.discountedPrice || (p.discount > 0 ? (p.discountType === 'Flat' ? Math.max(0, p.price - p.discount) : Math.max(0, p.price - (p.price * p.discount / 100))) : p.price);
                    return (
                      <div key={id} className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm border-0">
                        <span className="text-truncate fw-medium text-dark me-2" style={{ maxWidth: '180px' }}>{p.name}</span>
                        <span className="fw-bold" style={{ color: '#1c72b9' }}>₹{activePrice}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center fw-bold text-dark mb-4 p-3 rounded-4" style={{ backgroundColor: '#e0f2fe' }}>
                <span className="fs-5">Combo Total</span>
                <span className="fs-4" style={{ color: '#0369a1' }}>₹{comboSubtotal}</span>
              </div>

              <MgButton 
                onClick={handleAddComboToCart}
                disabled={selectedProductIds.length < 2}
                variant={selectedProductIds.length < 2 ? 'secondary' : 'primary'}
                className="w-100 rounded-pill py-3 fs-5 shadow-sm fw-bold"
              >
                {selectedProductIds.length < 2 ? 'Select at least 2 items' : 'Add Combo to Cart'}
              </MgButton>
            </MgCard>
          </div>
        </div>

      </div>
    </div>
  );
}
