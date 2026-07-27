"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { memo } from 'react';

const categories = [
  { label: 'Skin Care', image: '/category1.png', query: 'Skin Care', color: '#DDF4FF' },
  { label: 'Hair Care', image: '/category2.png', query: 'Hair Care', color: '#DDF7E3' },
  { label: 'Body Care', image: '/category3.png', query: 'Body Care', color: '#FEF9E7' },
  { label: 'Wellness', image: '/category4.png', query: 'Wellness', color: '#F0E6FF' },
  { label: 'Baby Care', image: '/category5.png', query: 'Baby Care', color: '#FFF0F5' },
  { label: 'Combos', image: '/combo1.jpg', query: 'Combo', color: '#E8F5E9' },
  { label: 'Gifting', image: '/category6.png', query: 'Gifting', color: '#FFF8E1' },
  { label: 'Offers', image: '/offer1.jpg', query: 'sale', color: '#FFEBEE', isOffer: true },
];

const CategoryIconRow = () => {
  return (
    <section style={{
      background: 'white',
      padding: '24px 0',
      borderBottom: '1px solid rgba(221,244,255,0.8)',
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="category-icon-row-container">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.isOffer ? '/shop' : `/shop?category=${encodeURIComponent(cat.query)}`}
              className="category-link-item"
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '80px', flex: '1' }}
            >
              {/* Circle */}
              <div className="category-circle category-circle-wrapper" style={{ background: cat.color }}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  width={56}
                  height={56}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%' }}
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
        .category-icon-row-container {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          overflow-x: hidden;
          width: 100%;
        }
        a:hover .category-circle { border-color: #3BAE56 !important; }
        section a:hover > div:last-child { opacity: 1 !important; }
        @media (max-width: 767px) {
          .category-icon-row-container {
            gap: 2px !important;
          }
          .category-link-item {
            min-width: unset !important;
            flex: 1 !important;
            gap: 6px !important;
          }
          .category-circle-wrapper {
            width: 36px !important;
            height: 36px !important;
          }
          .category-circle-wrapper img {
            width: 36px !important;
            height: 36px !important;
          }
          .category-label-text {
            font-size: 8.5px !important;
          }
        }
      `}} />
    </section>
  );
};

export default memo(CategoryIconRow);
