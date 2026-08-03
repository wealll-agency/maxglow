"use client";
import Link from 'next/link';
import React, { memo } from 'react';

const CashewsBanner = () => {
  return (
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Section Title matching the reference layout */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f1e35',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            TRENDING NOW
          </h2>
          <div style={{ height: '3px', width: '60px', background: '#3BAE56', margin: '12px auto 0', borderRadius: '9999px' }} />
        </div>

        <Link href="/shop" className="trending-banner-card">
          <style dangerouslySetInnerHTML={{ __html: `
            .trending-banner-card {
              display: block;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
              cursor: pointer;
              text-decoration: none;
              width: 100%;
            }
            .trending-banner-img {
              width: 100%;
              height: 280px;
              object-fit: cover;
              display: block;
            }
            @media (max-width: 768px) {
              .trending-banner-img {
                height: 140px !important;
              }
            }
          ` }} />
          <img
            src="/trending_banner.png"
            alt="Trending Now Banner"
            className="trending-banner-img"
          />
        </Link>

      </div>
    </section>
  );
};

export default memo(CashewsBanner);
