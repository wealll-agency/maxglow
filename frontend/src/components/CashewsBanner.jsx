"use client";
import Link from 'next/link';
import React, { memo } from 'react';

const CashewsBanner = () => {
  return (
    <section style={{ padding: '60px 0', background: 'white' }}>
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

        {/* Banner Card */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          aspectRatio: '16/6',
          minHeight: '260px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          backgroundImage: 'url("/trending_banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Darker left gradient overlay for text readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(15,30,53,0.7) 0%, rgba(15,30,53,0.4) 40%, rgba(15,30,53,0) 80%)',
            zIndex: 1,
          }} />

          {/* Banner Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '40px 48px',
            maxWidth: '550px',
            color: 'white',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: '800',
              color: 'white',
              lineHeight: '1.2',
              margin: '0 0 12px',
              textShadow: '1px 1px 4px rgba(0,0,0,0.3)',
            }}>
              Herbal Skincare
            </h3>
            
            <p style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: '800',
              color: '#facc15', // Vibrant yellow color matching the reference
              margin: '0 0 24px',
              letterSpacing: '0.03em',
            }}>
              STARTING <span style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>₹199</span>
            </p>

            <Link href="/shop" style={{
              display: 'inline-block',
              background: '#ef4444', // Red shop now button
              color: 'white',
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '13px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '12px 32px',
              borderRadius: '6px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              SHOP NOW
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default memo(CashewsBanner);
