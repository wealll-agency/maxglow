"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';

const categories = [
  { label: 'Skin Care', image: '/category-icons/skin-care.png', query: 'Skin Care', color: '#DDF4FF' },
  { label: 'Hair Care', image: '/category-icons/hair-care.png', query: 'Hair Care', color: '#DDF7E3' },
  { label: 'Body Care', image: '/category-icons/body-care.png', query: 'Body Care', color: '#FEF9E7' },
  { label: 'Wellness', image: '/category-icons/wellness.png', query: 'Wellness', color: '#F0E6FF' },
  { label: 'Baby Care', image: '/category-icons/baby-care.png', query: 'Baby Care', color: '#FFF0F5' },
  { label: 'Combos', image: '/category-icons/combos.png', query: 'Combo', color: '#E8F5E9' },
  { label: 'Gifting', image: '/category-icons/gifting.png', query: 'Gifting', color: '#FFF8E1' },
  { label: 'Offers', image: '/category-icons/offers.png', query: 'sale', color: '#FFEBEE', isOffer: true },
];

const CategoryIconRow = () => {
  return (
    <section className="category-icon-row-section">
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="category-icon-row-container">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.isOffer ? '/shop' : `/shop?category=${encodeURIComponent(cat.query)}`}
              className="category-link-item"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '90px', flexShrink: 0 }}
            >
              {/* Circle */}
              <div className="category-circle category-circle-wrapper" style={{ background: cat.color, width: '80px', height: '80px', minWidth: '80px', minHeight: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  width={56}
                  height={56}
                  style={{ width: '56px', height: '56px', objectFit: cat.image === '/logo.png' ? 'contain' : 'cover', padding: cat.image === '/logo.png' ? '8px' : '0', borderRadius: '50%' }}
                />
              </div>

              {/* Label */}
              <span className="category-label-text" style={{
                fontSize: '12px', fontWeight: '600', color: '#374151',
                textAlign: 'center', whiteSpace: 'nowrap',
                lineHeight: '1.2',
                fontFamily: 'var(--font-outfit), sans-serif',
              }}>
                {cat.isOffer ? <span style={{ color: '#ef4444', fontWeight: '700' }}>Offers</span> : cat.label}
              </span>

              {/* Active underline */}
              <div style={{
                height: '2px', width: '24px', borderRadius: '9999px',
                background: cat.isOffer
                  ? 'linear-gradient(90deg, #ef4444, #f97316)'
                  : 'linear-gradient(90deg, #4A90E2, #3BAE56)',
                opacity: 0,
                transition: 'opacity 0.2s ease',
              }} />
            </Link>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .category-icon-row-section {
          position: relative;
          z-index: 20;
          background: white;
          padding: 24px 0;
          border-bottom: 1px solid rgba(221,244,255,0.8);
          clear: both;
        }
        .category-icon-row-container {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          overflow-x: auto;
          overflow-y: visible; /* Prevent vertical clipping */
          scrollbar-width: none; /* Firefox */
          width: 100%;
          padding-top: 15px; /* Allow space for hover effects so circles don't clip */
          padding-bottom: 15px;
          margin-top: -15px; /* Offset the padding visually if needed, though padding is safer */
        }
        .category-icon-row-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        a:hover .category-circle { border-color: #3BAE56 !important; }
        section a:hover > div:last-child { opacity: 1 !important; }
        @media (max-width: 991px) {
          .category-icon-row-section {
            padding: 10px 0 !important;
          }
          .category-icon-row-container {
            gap: 2px !important;
            overflow-x: hidden !important; /* Strict rule: no horizontal scroll */
            justify-content: space-between !important;
          }
          /* Strict rule: only keep 5 categories on mobile and tablet */
          .category-link-item:nth-child(n+6) {
            display: none !important;
          }
          .category-link-item {
            min-width: unset !important;
            flex: 1 !important;
            gap: 6px !important;
          }
          .category-circle-wrapper {
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            min-height: 50px !important;
          }
          .category-circle-wrapper img {
            width: 32px !important;
            height: 32px !important;
          }
          .category-label-text {
            font-size: 10px !important;
            white-space: normal !important;
          }
        }
        @media (max-width: 576px) {
          .category-circle-wrapper {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
            min-height: 44px !important;
          }
          .category-circle-wrapper img {
            width: 24px !important;
            height: 24px !important;
          }
          .category-label-text {
            font-size: 9px !important;
          }
        }
      `}} />
    </section>
  );
};

export default memo(CategoryIconRow);
