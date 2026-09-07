"use client";
import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiGrid, FiList, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import { Leaf } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getImageUrl } from '../../utils/imageConfig';
import ShopBanner from './components/ShopBanner';
import ShopSidebar from './components/ShopSidebar';
import Pagination from './components/Pagination';

export default function ShopClient({ initialParams = {}, initialProducts = [], pagination = {}, serverCategories = [], serverSettings = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [viewType, setViewType] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  const currentCategory = initialParams.category || '';
  const currentSort = initialParams.sort || 'Best Selling';

  // Handle click outside for sort dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (newSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
    setIsSortOpen(false);
  };

  return (
    <>
      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        @media (max-width: 576px) {
          .shop-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
        
        .shop-banner-section {
          position: relative;
          overflow: hidden;
          min-height: 220px;
          display: flex;
          align-items: center;
          background-size: cover;
          background-position: right center;
          border-radius: 24px;
          margin: 20px auto 0;
          max-width: 1400px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        }
        
        .shop-banner-title {
          font-family: var(--font-outfit);
          font-size: 42px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        .shop-banner-desc {
          font-size: 16px;
          color: #334155;
          margin-top: 12px;
          max-width: 500px;
          font-weight: 500;
          line-height: 1.6;
        }
        
        .shop-banner-content {
          max-width: 1440px;
          margin: 0;
          padding: 40px 40px;
          width: 100%;
          position: relative;
          z-index: 2;
        }
        
        .shop-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 45%, rgba(255, 255, 255, 0.15) 100%);
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .shop-banner-section {
            min-height: 160px;
            background-position: right 25% center !important;
          }
          .shop-banner-title {
            font-size: 26px !important;
          }
          .shop-banner-desc {
            font-size: 13px !important;
            margin-top: 8px !important;
            max-width: 80% !important;
          }
          .shop-banner-content {
            padding: 24px 20px !important;
          }
          .shop-banner-overlay {
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 55%, rgba(255, 255, 255, 0.3) 100%) !important;
          }
        }
        
        @media (max-width: 480px) {
          .shop-banner-title {
            font-size: 22px !important;
          }
          .shop-banner-desc {
            max-width: 70% !important;
          }
        }

        @media (min-width: 992px) {
          .show-desktop-aside { display: block !important; }
          .show-mobile-filter-btn { display: none !important; }
        }
        @media (max-width: 991px) {
          .hide-mobile-view-btns { display: none !important; }
        }
      `}</style>

      <ShopBanner category={currentCategory} serverSettings={serverSettings} />

      <div style={{ maxWidth: '1400px', margin: '40px auto 60px', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Desktop Sidebar */}
          <aside className="show-desktop-aside" style={{ display: 'none', width: '280px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div style={{ padding: '0 16px 24px 0', background: 'transparent' }}>
              <ShopSidebar serverCategories={serverCategories} initialParams={initialParams} />
            </div>
          </aside>

          {/* Product Listing Area */}
          <div style={{ flex: 1, opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
            {/* View controls */}
            <div className="glass shop-controls-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(221,244,255,0.8)', position: 'relative', zIndex: 30 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F7FBFD', border: '1.5px solid #e2e8f0', borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                  className="show-mobile-filter-btn"
                >
                  <FiFilter /> Filter
                </button>

                <div style={{ display: 'flex', gap: '4px' }} className="hide-mobile-view-btns">
                  <button
                    onClick={() => setViewType('grid')}
                    style={{ background: viewType === 'grid' ? '#EAF8FF' : 'transparent', border: 'none', color: viewType === 'grid' ? '#4A90E2' : '#64748b', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    style={{ background: viewType === 'list' ? '#EAF8FF' : 'transparent', border: 'none', color: viewType === 'list' ? '#4A90E2' : '#64748b', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <FiList size={18} />
                  </button>
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }} className="hide-mobile-view-btns">
                  {initialProducts.length === 0 ? 'Loading products...' : `Showing ${pagination.totalProducts} products`}
                </span>
              </div>

              {/* Custom Sort by UI */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }} className="hide-mobile-sort-label">Sort by</span>
                <div ref={sortRef} style={{ position: 'relative' }}>
                  {/* Trigger Button */}
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: isSortOpen ? '#EAF8FF' : 'white',
                      border: isSortOpen ? '1.5px solid #3BAE56' : '1.5px solid #e2e8f0',
                      borderRadius: '9999px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', color: '#1a2332',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: isSortOpen ? '0 2px 8px rgba(59,174,86,0.15)' : 'none',
                    }}
                  >
                    <span>{currentSort === 'priceAsc' ? 'Price: Low to High' : currentSort === 'priceDesc' ? 'Price: High to Low' : currentSort === 'newest' ? 'Newest' : 'Best Selling'}</span>
                    <FiChevronDown size={14} style={{ color: isSortOpen ? '#3BAE56' : '#64748b', transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
                  </button>

                  {/* Floating Custom Menu */}
                  {isSortOpen && (
                    <div
                      className="sort-dropdown-menu"
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        background: 'white', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0', padding: '6px', minWidth: '180px', width: 'max-content', zIndex: 1000,
                      }}
                    >
                      {['Best Selling', 'Price: Low to High', 'Price: High to Low', 'Newest'].map((opt) => {
                        const optKey = opt === 'Price: Low to High' ? 'priceAsc' : opt === 'Price: High to Low' ? 'priceDesc' : opt === 'Newest' ? 'newest' : 'Best Selling';
                        const isSelected = currentSort === optKey || (!searchParams.has('sort') && opt === 'Best Selling');
                        return (
                          <button
                            key={opt}
                            onClick={() => handleSortChange(opt)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              width: '100%', padding: '10px 14px', borderRadius: '10px', border: 'none',
                              background: isSelected ? '#DDF7E3' : 'transparent', color: isSelected ? '#3BAE56' : '#374151',
                              fontSize: '13px', fontWeight: isSelected ? '700' : '500', cursor: 'pointer', textAlign: 'left',
                              transition: 'all 0.15s ease', marginBottom: '2px', whiteSpace: 'nowrap'
                            }}
                          >
                            <span style={{ marginRight: '12px' }}>{opt}</span>
                            {isSelected && <span style={{ color: '#3BAE56', fontWeight: '800' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid / List */}
            {initialProducts.length > 0 ? (
              <>
                {viewType === 'grid' ? (
                  <div className="shop-grid">
                    {initialProducts.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {initialProducts.map(product => {
                      const finalPrice = product.discountedPrice !== undefined ? product.discountedPrice : product.price;
                      const discountLabel = product.discount > 0 ? (product.discountType === 'Flat' ? `₹${product.discount} OFF` : `${product.discount}% OFF`) : null;
                      return (
                        <div key={product._id} className="mg-card" style={{ padding: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ width: '120px', height: '120px', flexShrink: 0, position: 'relative', background: '#F7FBFD', borderRadius: '12px', overflow: 'hidden' }}>
                            <Image src={getImageUrl(product.images?.[0] || product.image)} alt={product.name} fill sizes="120px" style={{ objectFit: 'contain', padding: '8px' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#3BAE56', letterSpacing: '0.08em', marginBottom: '4px' }}>MAXGLOW</div>
                            <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '16px', fontWeight: '700', color: '#1a2332', margin: '0 0 6px' }}>{product.name}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332' }}>₹{finalPrice}</span>
                              {product.discount > 0 && <del style={{ fontSize: '13px', color: '#94a3b8' }}>₹{product.price}</del>}
                              {discountLabel && <span className="mg-badge mg-badge-green" style={{ fontSize: '10px' }}>{discountLabel}</span>}
                            </div>
                          </div>
                          <Link href={`/product/${product.slug || product._id}`} className="btn-mg-primary" style={{ fontSize: '13px', padding: '10px 24px' }}>
                            View Details
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Pagination totalPages={pagination.totalPages} currentPage={pagination.currentPage} />
              </>
            ) : (
              <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }}>
                <Leaf size={40} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', marginBottom: '8px' }}>No Products Found</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Try clearing your filters or searching for something else.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter Drawer */}
      {isMobileFilterOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} onClick={() => setIsMobileFilterOpen(false)} />
      )}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh', width: '320px',
        background: 'white', zIndex: 9999, padding: '24px', display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 40px rgba(0,0,0,0.15)',
        transform: isMobileFilterOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '700', color: '#1a2332', margin: 0 }}>Filters</h3>
          <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <FiX size={20} />
          </button>
        </div>

        <ShopSidebar serverCategories={serverCategories} isMobile={true} initialParams={initialParams} />
      </div>
    </>
  );
}
