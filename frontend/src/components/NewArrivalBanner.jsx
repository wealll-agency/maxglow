"use client";
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const NewArrivalBanner = () => {
  const [bgImage, setBgImage] = useState('/new_arrival_banner.png');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_new_arrivals) {
          if (res.data.settings.media_new_arrivals.trim() !== '') {
            setBgImage(res.data.settings.media_new_arrivals);
          }
        }
      } catch (err) {}
    };
    fetchImage();
  }, []);

  return (
    <section style={{ padding: '40px 0', background: 'white' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Banner Card */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          aspectRatio: '16/3.2',
          minHeight: '180px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          backgroundImage: `url("${bgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Light-Green elegant overlay for readability on left side */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(247,251,253,0.94) 0%, rgba(247,251,253,0.85) 40%, rgba(247,251,253,0) 80%)',
            zIndex: 1,
          }} />

          {/* Banner Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '24px 40px',
            maxWidth: '520px',
            color: '#1a2332',
          }}>
            <span style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '11px',
              fontWeight: '700',
              color: '#3BAE56',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              display: 'block',
              marginBottom: '6px',
            }}>
              New Arrivals
            </span>

            <h3 style={{
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: 'clamp(20px, 3.2vw, 30px)',
              fontWeight: '800',
              color: '#1a2332',
              lineHeight: '1.2',
              margin: '0 0 8px',
            }}>
              Pure Botanical Luxury
            </h3>
            
            <p style={{
              fontSize: 'clamp(12px, 1.6vw, 14px)',
              color: '#475569',
              margin: '0 0 16px',
              lineHeight: '1.4',
              fontWeight: '500',
            }}>
              Revitalize your skincare regime with our newly launched herbal infusions and cold-pressed botanical essentials, crafted for absolute radiance.
            </p>

            <Link href="/shop" style={{
              display: 'inline-block',
              background: '#1a2332',
              color: 'white',
              fontFamily: 'var(--font-outfit), sans-serif',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '10px 24px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(26,35,50,0.15)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#3BAE56';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1a2332';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Explore Collection
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default memo(NewArrivalBanner);
