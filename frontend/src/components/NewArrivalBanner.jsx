"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const NewArrivalBanner = () => {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_new_arrivals) {
          if (res.data.settings.media_new_arrivals.trim() !== '') {
            setBgImage(res.data.settings.media_new_arrivals);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setBgImage('/new_arrival_banner.png'); // Fallback if no dynamic images exist
    };
    fetchImage();
  }, []);

  return (
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Banner Card */}
        <style dangerouslySetInnerHTML={{ __html: `
          .new-arrival-banner-card {
            display: block;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            cursor: pointer;
            text-decoration: none;
            width: 100%;
            aspect-ratio: 1400 / 300;
          }
          .new-arrival-banner-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          @media (max-width: 768px) {
            .new-arrival-banner-card {
              aspect-ratio: auto;
            }
            .new-arrival-banner-img {
              height: 140px !important;
            }
          }
        ` }} />
        <Link href="/shop" className="new-arrival-banner-card">
          {bgImage ? (
            <Image
              src={bgImage}
              alt="New Arrivals Banner"
              width={1400}
              height={300}
              sizes="100vw"
              className="new-arrival-banner-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div className="new-arrival-banner-img" style={{ backgroundColor: '#f1f5f9' }} />
          )}
        </Link>

      </div>
    </section>
  );
};

export default memo(NewArrivalBanner);
