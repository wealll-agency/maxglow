"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import React, { memo } from 'react';

const categories = [
  { label: 'Skin Care', image: '/category-icons/skin-care.png', query: 'Skin Care', color: '#DDF4FF', glowColor: 'rgba(74, 144, 226, 0.35)' },
  { label: 'Hair Care', image: '/category-icons/hair-care.png', query: 'Hair Care', color: '#DDF7E3', glowColor: 'rgba(59, 174, 86, 0.35)' },
  { label: 'Serum', image: '/category-icons/wellness.png', query: 'Serum', color: '#F0E6FF', glowColor: 'rgba(155, 81, 224, 0.35)' },
  { label: 'Sheet Mask', image: '/category-icons/baby-care.png', query: 'Sheet Mask', color: '#FFF0F5', glowColor: 'rgba(255, 105, 180, 0.35)' },
  { label: 'Combos', image: '/category-icons/combos.png', query: 'Combo', color: '#E8F5E9', glowColor: 'rgba(46, 125, 50, 0.35)' },
  { label: 'Gifting', image: '/category-icons/gifting.png', query: 'Gifting', color: '#FFF8E1', glowColor: 'rgba(255, 160, 0, 0.35)' },
  { label: 'Offers', image: '/category-icons/offers.png', query: 'sale', color: '#FFEBEE', isOffer: true, glowColor: 'rgba(239, 68, 68, 0.35)' },
];

const CategoryIconRow = () => {
  const router = useRouter();

  return (
    <section className="category-icon-row-section">
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="category-title-wrapper" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="category-section-title" style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '28px',
            fontWeight: '800',
            color: '#1a2332',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Shop By Product
          </h2>
          <div style={{ width: '40px', height: '3px', background: '#3BAE56', margin: '8px auto 0', borderRadius: '2px' }} />
        </div>
        <div className="category-icon-row-container">
          {categories.map((cat, idx) => {
            const targetHref = cat.isOffer ? '/shop' : `/shop?category=${encodeURIComponent(cat.query)}`;
            return (
              <Link
                key={idx}
                href={targetHref}
                prefetch={true}
                onMouseEnter={() => router.prefetch(targetHref)}
                className="category-link-item"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '110px', flexShrink: 0 }}
              >
              {/* Circle */}
              <div className="category-circle category-circle-wrapper" style={{ background: cat.color, width: '100px', height: '100px', minWidth: '100px', minHeight: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${cat.glowColor}`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  width={70}
                  height={70}
                  style={{ width: '70px', height: '70px', objectFit: cat.image === '/logo.png' ? 'contain' : 'cover', padding: cat.image === '/logo.png' ? '8px' : '0', borderRadius: '50%' }}
                />
              </div>

              {/* Label */}
              <span className="category-label-text" style={{
                fontSize: '13px', fontWeight: '700', color: '#374151',
                textAlign: 'center', whiteSpace: 'nowrap',
                lineHeight: '1.2',
                fontFamily: 'var(--font-outfit), sans-serif',
              }}>
                {cat.isOffer ? <span style={{ color: '#ef4444', fontWeight: '800' }}>Offers</span> : cat.label}
              </span>
            </Link>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .category-icon-row-section {
          position: relative;
          z-index: 20;
          background: linear-gradient(180deg, #F4FAF6 0%, #FFFFFF 100%);
          padding: 30px 0 20px;
          border-bottom: 1px solid rgba(221,244,255,0.8);
          clear: both;
        }
        .category-section-title {
          font-size: 28px !important;
          font-weight: 800 !important;
        }
        @media (max-width: 768px) {
          .category-section-title {
            font-size: 20px !important;
          }
          .category-title-wrapper {
            margin-bottom: 12px !important;
          }
        }
        .category-icon-row-container {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          overflow-x: auto;
          overflow-y: visible; /* Prevent vertical clipping */
          scrollbar-width: none; /* Firefox */
          width: 100%;
          padding-top: 10px; /* Allow space for hover effects so circles don't clip */
          padding-bottom: 10px;
        }
        .category-icon-row-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .category-link-item:hover .category-circle {
          transform: translateY(-4px) scale(1.06) !important;
          box-shadow: 0 14px 28px rgba(0,0,0,0.12) !important;
        }
        @media (max-width: 991px) {
          .category-icon-row-section {
            padding: 14px 0 !important;
          }
          .category-icon-row-container {
            gap: 4px !important;
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
            width: 76px !important;
            height: 76px !important;
            min-width: 76px !important;
            min-height: 76px !important;
          }
          .category-circle-wrapper img {
            width: 52px !important;
            height: 52px !important;
          }
          .category-label-text {
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #1a2332 !important;
            white-space: normal !important;
          }
        }
        @media (max-width: 576px) {
          .category-link-item {
            gap: 4px !important;
            padding: 0 1px !important;
          }
          .category-circle-wrapper {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            min-width: unset !important;
            min-height: unset !important;
            max-width: 68px !important;
            max-height: 68px !important;
          }
          .category-circle-wrapper img {
            width: 60% !important;
            height: 60% !important;
          }
          .category-label-text {
            font-size: clamp(9px, 2.6vw, 11.5px) !important;
            font-weight: 700 !important;
            color: #1a2332 !important;
            letter-spacing: -0.02em !important;
          }
        }
      `}} />
    </section>
  );
};

export default memo(CategoryIconRow);
