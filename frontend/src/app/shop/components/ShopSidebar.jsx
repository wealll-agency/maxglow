"use client";
import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiChevronDown, FiFilter } from 'react-icons/fi';

export default function ShopSidebar({ serverCategories, isMobile = false, initialParams = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentCategory = initialParams.category || '';
  const currentMinPrice = initialParams.minPrice || '';
  const currentMaxPrice = initialParams.maxPrice || '';
  const currentStock = initialParams.inStock === 'true' ? 'In Stock' : (initialParams.inStock ? 'Out Of Stock' : null);

  const [priceFrom, setPriceFrom] = useState(currentMinPrice);
  const [priceTo, setPriceTo] = useState(currentMaxPrice);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Decoupled debounced state for URL syncing
  const [debouncedMin, setDebouncedMin] = useState(currentMinPrice);
  const [debouncedMax, setDebouncedMax] = useState(currentMaxPrice);

  const updateUrlParams = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
      // Clear keyword if a strict category is selected to prevent conflicts
      if (key === 'category') {
        params.delete('keyword');
      }
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  // 1. Debounce the input values
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMin(priceFrom);
      setDebouncedMax(priceTo);
    }, 600);
    return () => clearTimeout(handler);
  }, [priceFrom, priceTo]);

  // 2. Trigger router.push ONLY when the debounced values change
  useEffect(() => {
    // Only push if the debounced value actually differs from the CURRENT URL
    if (debouncedMin === currentMinPrice && debouncedMax === currentMaxPrice) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedMin) params.set('minPrice', debouncedMin);
    else params.delete('minPrice');
    
    if (debouncedMax) params.set('maxPrice', debouncedMax);
    else params.delete('maxPrice');
    
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]); 

  const clearAllFilters = () => {
    setPriceFrom('');
    setPriceTo('');
    startTransition(() => {
      router.push('/shop', { scroll: false });
    });
  };

  const isAnyFilterActive = currentCategory || currentMinPrice || currentMaxPrice || currentStock;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s', background: '#fff', padding: isMobile ? '0' : '24px', borderRadius: isMobile ? '0' : '16px', border: isMobile ? 'none' : '1px solid #f1f5f9' }}>
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter size={18} color="#1a2332" />
            <h3 style={{ fontFamily: 'var(--font-outfit)', fontSize: '18px', fontWeight: '800', color: '#1a2332', margin: 0 }}>Filter By</h3>
          </div>
          <button onClick={clearAllFilters} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '700', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
            Clear All
          </button>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Price Range</h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>₹</span>
            <input
              type="number"
              className="mg-input"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              style={{ paddingLeft: '22px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>to</span>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>₹</span>
            <input
              type="number"
              className="mg-input"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              style={{ paddingLeft: '22px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 0 0' }}>
        <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Availability</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['In Stock', 'Out Of Stock'].map(stock => {
            const isSelected = currentStock === stock;
            return (
              <button
                key={stock}
                onClick={() => updateUrlParams('inStock', isSelected ? null : (stock === 'In Stock' ? 'true' : 'false'))}
                style={{
                  padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                  background: '#fff',
                  border: `1px solid ${isSelected ? '#3BAE56' : '#e2e8f0'}`,
                  color: isSelected ? '#3BAE56' : '#475569', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {stock}
              </button>
            )
          })}
        </div>
      </div>

      {/* Categories */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 0 0' }}>
        <h4 style={{ fontFamily: 'var(--font-outfit)', fontSize: '14px', fontWeight: '700', color: '#1a2332', marginBottom: '12px' }}>Category</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {serverCategories.length > 0 ? (
            <>
              {(showAllCategories ? serverCategories : serverCategories.slice(0, 6)).map(cat => {
                const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => updateUrlParams('category', isSelected ? null : cat)}
                    style={{
                      padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '500',
                      background: '#fff',
                      border: `1px solid ${isSelected ? '#3BAE56' : '#e2e8f0'}`,
                      color: isSelected ? '#3BAE56' : '#475569', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
              {serverCategories.length > 6 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  style={{
                    padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700',
                    background: 'transparent', border: 'none', color: '#4A90E2', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {showAllCategories ? 'View Less' : 'View All'}
                  <FiChevronDown style={{ transform: showAllCategories ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
              )}
            </>
          ) : (
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>No categories found</span>
          )}
        </div>
      </div>
      
      {isMobile && (
        <div style={{ borderTop: '1.5px solid #f1f5f9', paddingTop: '20px', marginTop: 'auto' }}>
          <button
            onClick={clearAllFilters}
            style={{ width: '100%', background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '9999px', padding: '12px', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
