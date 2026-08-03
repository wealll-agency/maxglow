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
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Banner Card */}
        <Link href="/shop" style={{
          display: 'block',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          cursor: 'pointer',
          textDecoration: 'none',
          width: '100%',
        }}>
          <img
            src={bgImage}
            alt="New Arrivals Banner"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Link>

      </div>
    </section>
  );
};

export default memo(NewArrivalBanner);
