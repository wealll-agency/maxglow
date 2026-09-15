"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageConfig';

const CashewsBanner = () => {
  const [bannerImg, setBannerImg] = useState('');
  const [bannerImgMobile, setBannerImgMobile] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings) {
          setBannerImg(res.data.settings.media_trending_banner && res.data.settings.media_trending_banner.trim() !== '' ? res.data.settings.media_trending_banner : '/trending_banner.png');
          setBannerImgMobile(res.data.settings.media_trending_banner_mobile && res.data.settings.media_trending_banner_mobile.trim() !== '' ? res.data.settings.media_trending_banner_mobile : (res.data.settings.media_trending_banner || '/trending_banner.png'));
          return;
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setBannerImg('/trending_banner.png');
      setBannerImgMobile('/trending_banner.png');
    };
    fetchBanner();
  }, []);

  // getImageUrl imported from utils/imageConfig.js
  return (
    <section className="mg-section-spacing" style={{ background: 'white', paddingBottom: '10px' }}>
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
              height: 100%;
              object-fit: cover;
              display: block;
            }
            .t-banner-desktop {
              display: block;
              aspect-ratio: 1400 / 300;
            }
            .t-banner-mobile {
              display: none;
              aspect-ratio: 16 / 9;
            }
            @media (max-width: 768px) {
              .t-banner-desktop {
                display: none;
              }
              .t-banner-mobile {
                display: block;
              }
            }
          ` }} />
          {bannerImg ? (
            <>
              <Image
                src={getImageUrl(bannerImg)}
                alt="Trending Now Banner Desktop"
                width={1400}
                height={300}
                sizes="100vw"
                className="trending-banner-img t-banner-desktop"
                loading="lazy"
              />
              <Image
                src={getImageUrl(bannerImgMobile)}
                alt="Trending Now Banner Mobile"
                width={600}
                height={338}
                sizes="100vw"
                className="trending-banner-img t-banner-mobile"
                loading="lazy"
              />
            </>
          ) : (
            <div className="trending-banner-img" style={{ backgroundColor: '#f1f5f9', aspectRatio: '1400/300' }} />
          )}
        </Link>

      </div>
    </section>
  );
};

export default memo(CashewsBanner);
