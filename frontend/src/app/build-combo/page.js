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
  
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="container build-combo-wrapper py-5">
      <section className="build-combo-banner" style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url("/trending_banner.png")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '24px',
        margin: '20px auto 40px',
        maxWidth: '1400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        <style>{`
          @media (max-width: 768px) {
            .build-combo-wrapper {
              padding-top: 16px !important;
            }
            .build-combo-banner { 
              min-height: 240px !important;
              background-position: 70% center !important;
              margin: 0 auto 30px !important;
              border-radius: 16px !important;
            }
            .build-combo-gradient {
              background: linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 70%, rgba(255, 255, 255, 0) 100%) !important;
            }
            .build-combo-content {
              padding: 24px 20px !important;
            }
            .build-combo-title {
              font-size: 28px !important;
              line-height: 1.2 !important;
            }
            .build-combo-text {
              font-size: 14px !important;
            }
            .combo-dropdown-content {
              max-height: 0;
              overflow: hidden;
              opacity: 0;
              margin-top: 0;
              transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, margin-top 0.4s ease;
            }
            .combo-dropdown-content.open {
              max-height: 800px;
              opacity: 1;
              margin-top: 16px;
            }
          }
        `}</style>
        <div className="build-combo-gradient" style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 45%, rgba(255, 255, 255, 0.1) 100%)',
          zIndex: 1,
        }} />
        <div className="build-combo-content" style={{ maxWidth: '1440px', margin: '0', padding: '40px 40px', width: '100%', position: 'relative', zIndex: 2 }}>
          <nav style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', fontWeight: '500' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
            <span style={{ color: '#1a2332', fontWeight: '700', marginLeft: '6px' }}>Build Combo</span>
          </nav>
          <span className="d-inline-block px-3 py-1 rounded-pill mb-2 fw-bold" style={{ backgroundColor: '#eef6ff', color: '#1c72b9', fontSize: '0.75rem', letterSpacing: '1px' }}>
            GIFTING & BUNDLES
          </span>
          <h1 className="build-combo-title" style={{ fontFamily: 'var(--font-outfit)', fontSize: '42px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
            Build Your Custom Combo
          </h1>
          <p className="build-combo-text" style={{ fontSize: '16px', color: '#334155', marginTop: '12px', maxWidth: '500px', fontWeight: '500', lineHeight: '1.6' }}>
            Select your favorite products to create a personalized gift box. Apply our special Combo Coupons at checkout to unlock amazing discounts!
          </p>
        </div>
      </section>

      <div className="row g-4">
        {/* Left Side: Product Grid */}
        <div className="col-lg-8">
          {loading ? (
            <div className="row g-3 g-md-4">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="col-6 col-md-4">
                  <div className="placeholder-glow">
                    <div className="placeholder bg-light w-100 rounded-4 mb-2" style={{ height: '280px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-3 g-md-4" id="shopProductGrid">
              {products.map((product) => {
                const isSelected = selectedProductIds.includes(product._id);
                
                return (
                  <div key={product._id} className="col-6 col-md-4">
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
        <div className="col-lg-4 order-first order-lg-last mb-4 mb-lg-0">
          <div className="position-sticky" style={{ top: isMobile ? '70px' : '100px', zIndex: 100 }}>
            <MgCard className={`shadow-lg border-0 ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#f8fafc' }}>
              <div 
                className={`d-flex align-items-center justify-content-between ${isMobile ? 'm-0' : 'mb-4 pb-3 border-bottom border-light'}`}
                onClick={() => isMobile && setIsMobileSummaryOpen(!isMobileSummaryOpen)}
                style={{ cursor: isMobile ? 'pointer' : 'default' }}
              >
                <div className="d-flex align-items-center">
                  <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3" style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', backgroundColor: '#1c72b9' }}>
                    <i className="fas fa-shopping-bag" style={{ fontSize: isMobile ? '14px' : 'inherit' }}></i>
                  </div>
                  <h4 className={`fw-bold m-0 text-dark ${isMobile ? 'fs-5' : ''}`}>Combo Summary</h4>
                </div>
                {isMobile && (
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-pill px-3 py-1 fs-6">{selectedProductIds.length}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isMobileSummaryOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#64748b' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                )}
              </div>
              
              <div className={isMobile ? `combo-dropdown-content ${isMobileSummaryOpen ? 'open' : ''}` : 'mt-4'}>
                {!isMobile && (
                  <div className="d-flex justify-content-between align-items-center text-secondary mb-4 p-3 rounded-3" style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
                    <span className="fw-medium fs-6">Items Selected</span>
                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{selectedProductIds.length}</span>
                  </div>
                )}

                <div className="d-flex flex-column gap-3 mb-4 pe-2" style={{ maxHeight: isMobile ? '250px' : '350px', overflowY: 'auto' }}>
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
              </div>
            </MgCard>
          </div>
        </div>

      </div>
    </div>
  );
}
