"use client";
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const CashewsBanner = () => {
  const [bannerImg, setBannerImg] = useState('/trending_banner.png');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_trending_banner) {
          setBannerImg(res.data.settings.media_trending_banner);
        }
      } catch (err) {}
    };
    fetchBanner();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '/trending_banner.png';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    if (url.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'https://api.maxglow.in';
      return `${baseUrl}${url}`;
    }
    return url;
  };
  return (
    <section className="mg-section-spacing" style={{ background: 'white' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Default text removed as requested */}

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
            src={getImageUrl(bannerImg)}
            alt="Trending Now Banner"
            className="trending-banner-img"
          />
        </Link>

      </div>
    </section>
  );
};

export default memo(CashewsBanner);
