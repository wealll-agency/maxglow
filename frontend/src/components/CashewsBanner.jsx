"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const CashewsBanner = () => {
  const [bannerImg, setBannerImg] = useState(''); // Initialize empty to prevent cache flashing

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_trending_banner) {
          setBannerImg(res.data.settings.media_trending_banner);
          return;
        }
      } catch (err) {}
      setBannerImg('/trending_banner.png'); // Fallback only if no dynamic images exist
    };
    fetchBanner();
  }, []);

  const getImageUrl = (url) => {
    if (!url) return '/trending_banner.png';
    let cleanedUrl = url;
    if (typeof cleanedUrl === 'string' && cleanedUrl.includes('/uploads/')) {
      cleanedUrl = cleanedUrl.substring(cleanedUrl.indexOf('/uploads/'));
    }
    if (cleanedUrl.startsWith('http') || cleanedUrl.startsWith('blob:')) return cleanedUrl;
    if (cleanedUrl.startsWith('/uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : '';
      if (cleanedUrl.toLowerCase().endsWith('.mp4') || cleanedUrl.toLowerCase().endsWith('.webm')) {
        return `${baseUrl}/api${cleanedUrl}`;
      }
      return cleanedUrl;
    }
    return cleanedUrl;
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
          {bannerImg ? (
            <Image
              src={getImageUrl(bannerImg)}
              alt="Trending Now Banner"
              width={1440}
              height={280}
              sizes="100vw"
              className="trending-banner-img"
              priority
            />
          ) : (
            <div className="trending-banner-img" style={{ backgroundColor: '#f1f5f9' }} />
          )}
        </Link>

      </div>
    </section>
  );
};

export default memo(CashewsBanner);
