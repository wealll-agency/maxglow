'use client';

import { useEffect, useState, Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice.js';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/axiosConfig';

export default function BuildComboPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading combo boxes...</div>}>
      <ComboListingContent />
    </Suspense>
  );
}

function ComboListingContent() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('grid');
  const [sortBy, setSortBy] = useState('Best Selling');
  const { showAlert } = useNotification();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await api.get('/combos');
        if (res.data.success) {
          setCombos(res.data.combos);
        }
      } catch (err) {
        console.error('Failed to load combos');
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  const handleAddToCart = (e, combo) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch(addToCart({
      combo,
      itemType: 'Combo',
      quantity: 1,
      size: 'Standard'
    }));

    showAlert(`${combo.name} added to cart`, 'success');

    if (typeof window !== 'undefined' && window.bootstrap) {
      const offcanvas = document.getElementById('cartOffcanvas');
      if (offcanvas) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
        bsOffcanvas.show();
      }
    }
  };

  return (
    <div className="build-combo-wrapper" style={{ paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1400px', margin: '20px auto 0', padding: '0 20px' }}>
        <nav style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> &gt; 
          <span style={{ color: '#1a2332', fontWeight: '700', marginLeft: '6px' }}>MaxGlow Combos</span>
        </nav>
      </div>

      <style>{`
        .shop-banner-section {
          position: relative;
          overflow: hidden;
          min-height: 220px;
          display: flex;
          align-items: center;
          border-radius: 24px;
          margin: 20px auto 40px;
          max-width: 1400px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          width: 100%;
        }
        @media (max-width: 768px) {
          .shop-banner-section {
            min-height: 160px;
            margin-bottom: 24px;
          }
        }
      `}</style>
      <div className="shop-banner-section">
        <Image
          src="/trending_banner.png"
          alt="MaxGlow Premium Combos"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1400px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Sort by</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select form-select-sm border-0 px-3" 
              style={{ width: '180px', borderRadius: '9999px', background: '#f8fafc', boxShadow: 'inset 0 0 0 1px #e2e8f0', fontWeight: '600', color: '#1e293b', padding: '8px 16px', height: '40px', appearance: 'none', cursor: 'pointer' }}
            >
              <option>Best Selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="col-sm-6 col-md-4 col-lg-3 px-2 py-3">
              <div className="placeholder-glow">
                <div className="placeholder bg-light w-100 rounded mb-2" style={{ height: '300px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-5">
          <h4 className="text-muted">No Combos available at the moment.</h4>
          <p>Please check back later.</p>
        </div>
      ) : (
        <div className={viewType === 'grid' ? "row g-4" : "row g-3"} id="shopProductGrid">
          {(() => {
            const sortedCombos = [...combos].sort((a, b) => {
              if (sortBy === 'Price: Low to High') {
                return a.comboPrice - b.comboPrice;
              }
              if (sortBy === 'Price: High to Low') {
                return b.comboPrice - a.comboPrice;
              }
              if (sortBy === 'Newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
              }
              return 0;
            });

            return sortedCombos.map((combo) => {
              const mrp = combo.regularTotal || 0;
              const savings = Math.max(0, mrp - combo.comboPrice);
              
              let image = '/placeholder.png';
              if (combo.image) {
                image = combo.image.replace('/assets/images/', '/');
              }

              // Calculate Availability (Combo stock)
              let maxStock = Infinity;
              combo.components?.forEach(comp => {
                if (comp.product) {
                  const possible = Math.floor((comp.product.stock || 0) / comp.quantity);
                  if (possible < maxStock) maxStock = possible;
                } else {
                  maxStock = 0;
                }
              });

              const isOutOfStock = maxStock <= 0;

              return viewType === 'grid' ? (
                <div key={combo._id} className="col-12 col-sm-6 col-md-4 col-lg-3 px-2 py-3">
                  <div className="mg-product-card" style={{ height: '100%', position: 'relative', border: '2px solid transparent', borderRadius: '16px' }}>
                    <div className="mg-product-image-wrap" style={{ position: 'relative', aspectRatio: '1 / 1', width: '100%', overflow: 'hidden' }}>
                      
                      {savings > 0 && (
                        <div className="mg-product-tag mg-tag-left" style={{
                          position: 'absolute', top: '12px', left: '12px', zIndex: 10,
                          background: 'linear-gradient(135deg, #3BAE56, #61C454)',
                          color: 'white', fontSize: '11px', fontWeight: '800',
                          padding: '4px 10px', borderRadius: '9999px',
                          boxShadow: '0 2px 8px rgba(59,174,86,0.3)',
                          letterSpacing: '0.03em',
                        }}>
                          ₹{savings} OFF
                        </div>
                      )}
                      
                      <div className="mg-product-tag mg-tag-right" style={{
                        position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                        color: 'white', fontSize: '11px', fontWeight: '800',
                        padding: '4px 10px', borderRadius: '9999px',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase'
                      }}>
                        COMBO
                      </div>

                      {isOutOfStock && (
                        <div style={{
                          position: 'absolute', inset: 0, zIndex: 8,
                          background: 'rgba(248,250,252,0.7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{
                            background: '#ef4444', color: 'white', fontWeight: '700',
                            fontSize: '12px', padding: '6px 16px', borderRadius: '9999px',
                            boxShadow: '0 4px 12px rgba(239,68,68,0.3)', letterSpacing: '0.05em',
                          }}>OUT OF STOCK</span>
                        </div>
                      )}

                      {/* Wishlist Button Placeholder */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); showAlert('Wishlist feature for combos coming soon!', 'info'); }}
                        style={{
                          position: 'absolute', bottom: '12px', right: '12px', zIndex: 10,
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.9)',
                          border: '1.5px solid rgba(221,244,255,0.8)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', backdropFilter: 'blur(8px)',
                          transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>

                      <Link href={`/combos/${combo._id}`} onClick={(e) => isOutOfStock && e.preventDefault()} style={{ display: 'block', position: 'relative', height: '100%', width: '100%' }}>
                        <Image 
                          src={image} 
                          alt={combo.name} 
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {combo.brand || 'MaxGlow'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>5.0</span>
                        </div>
                      </div>

                      <Link href={`/combos/${combo._id}`} style={{ textDecoration: 'none', marginBottom: '10px' }}>
                        <h3 style={{
                          fontFamily: 'var(--font-outfit), sans-serif',
                          fontSize: '14px', fontWeight: '600', color: '#1a2332',
                          lineHeight: '1.4', margin: 0,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                          overflow: 'hidden', minHeight: '40px',
                        }} title={combo.name}>
                          {combo.name}
                        </h3>
                      </Link>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>
                          ₹{combo.comboPrice}
                        </span>
                        {mrp > combo.comboPrice && (
                          <del style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '400' }}>₹{mrp}</del>
                        )}
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({combo.components?.length} Items)</span>
                      </div>

                      <div className="product-actions-container" style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                        {isOutOfStock ? (
                          <Link href={`/combos/${combo._id}`} className="mg-product-action-btn" style={{
                            flex: 1, textAlign: 'center', padding: '10px 0',
                            background: '#f1f5f9', color: '#64748b',
                            borderRadius: '9999px', fontSize: '13px', fontWeight: '700',
                            textDecoration: 'none', border: '1.5px solid #e2e8f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            Notify Me
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={(e) => handleAddToCart(e, combo)}
                              className="mg-product-action-btn"
                              style={{
                                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                color: 'white', borderRadius: '9999px', fontSize: '12px', fontWeight: '800',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                transition: 'all 0.2s ease', letterSpacing: '0.01em',
                              }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                              <ShoppingCart size={15} /> CART
                            </button>
                            <button
                              onClick={(e) => {
                                handleAddToCart(e, combo);
                                window.location.href = '/checkout';
                              }}
                              className="mg-product-action-btn"
                              style={{
                                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #3BAE56 0%, #61C454 100%)',
                                color: 'white', borderRadius: '9999px', fontSize: '12px', fontWeight: '800',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                transition: 'all 0.2s ease', letterSpacing: '0.01em',
                                boxShadow: '0 4px 12px rgba(59,174,86,0.25)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,174,86,0.4)'}
                              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,174,86,0.25)'}
                            >
                              BUY
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="col-12" key={combo._id}>
                  <div className="card border-0 shadow-sm p-3 rounded-3" style={{ border: '1px solid #f1f5f9', transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04)'}>
                    <div className="row g-0 align-items-center">
                      <div className="col-4 col-md-3 text-center position-relative" style={{ height: '130px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                        <Image 
                          src={image} 
                          className="img-fluid rounded" 
                          alt={combo.name} 
                          fill
                          sizes="(max-width: 768px) 33vw, 25vw"
                          style={{ objectFit: 'cover' }} 
                        />
                      </div>
                      <div className="col-8 col-md-9 ps-3 ps-md-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge mb-1" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>{combo.brand || 'MaxGlow'}</span>
                            <h5 style={{ fontFamily: 'var(--font-outfit)', fontWeight: '600', color: '#1a2332', fontSize: '18px', marginBottom: '4px' }}>{combo.name}</h5>
                            <p className="text-muted fs-7 mb-2 text-truncate-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>Premium curated combo featuring {combo.components?.length || 0} carefully selected items.</p>
                          </div>
                          {savings > 0 && <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>₹{savings} OFF</span>}
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#3BAE56', fontSize: '20px' }}>₹{combo.comboPrice}</span>
                          {mrp > combo.comboPrice && (
                            <span className="text-muted text-decoration-line-through fs-7">₹{mrp}</span>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <Link href={`/combos/${combo._id}`} className="btn btn-sm text-white" style={{ backgroundColor: '#1a2332', borderRadius: '8px', padding: '6px 16px', fontWeight: '500' }}>
                            View Details
                          </Link>
                          {!isOutOfStock && (
                            <button onClick={(e) => handleAddToCart(e, combo)} className="btn btn-sm text-white" style={{ backgroundColor: '#3BAE56', borderRadius: '8px', padding: '6px 16px', fontWeight: '500' }}>
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Pagination */}
      {!loading && combos.length > 0 && (
        <div className="pagination-wrapper d-flex justify-content-center mt-5 mb-5">
          <nav>
            <ul className="pagination" style={{ margin: 0 }}>
              <li className="page-item active"><span className="page-link" style={{ backgroundColor: '#3BAE56', borderColor: '#3BAE56', color: '#fff', borderRadius: '8px' }}>1</span></li>
            </ul>
          </nav>
        </div>
      )}

      </div>
    </div>
  );
}
