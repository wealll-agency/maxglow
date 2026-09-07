"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { getImageUrl } from '../utils/imageConfig';

const NewArrivalBanner = () => {
  const [bgImage, setBgImage] = useState('');
  const [bgImageMobile, setBgImageMobile] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings) {
          setBgImage(res.data.settings.media_new_arrivals && res.data.settings.media_new_arrivals.trim() !== '' ? res.data.settings.media_new_arrivals : '/new_arrival_banner.png');
          setBgImageMobile(res.data.settings.media_new_arrivals_mobile && res.data.settings.media_new_arrivals_mobile.trim() !== '' ? res.data.settings.media_new_arrivals_mobile : (res.data.settings.media_new_arrivals || '/new_arrival_banner.png'));
          return;
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setBgImage('/new_arrival_banner.png');
      setBgImageMobile('/new_arrival_banner.png');
    };
    fetchImage();
  }, []);

  return (
    <section className="mg-section-spacing" style={{ background: 'white', paddingBottom: '10px' }}>
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
          }
          .new-arrival-banner-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
          .banner-desktop {
            display: block;
            aspect-ratio: 1400 / 300;
          }
          .banner-mobile {
            display: none;
            aspect-ratio: 16 / 9;
          }
          @media (max-width: 768px) {
            .banner-desktop {
              display: none;
            }
            .banner-mobile {
              display: block;
            }
          }
        ` }} />
        <Link href="/shop" className="new-arrival-banner-card">
          {bgImage ? (
            <>
              <Image
                src={getImageUrl(bgImage)}
                alt="New Arrivals Banner Desktop"
                width={1400}
                height={300}
                sizes="100vw"
                className="new-arrival-banner-img banner-desktop"
              />
              <Image
                src={getImageUrl(bgImageMobile)}
                alt="New Arrivals Banner Mobile"
                width={600}
                height={338}
                sizes="100vw"
                className="new-arrival-banner-img banner-mobile"
              />
            </>
          ) : (
            <div className="new-arrival-banner-img" style={{ backgroundColor: '#f1f5f9', aspectRatio: '1400/300' }} />
          )}
        </Link>

      </div>
    </section>
  );
};

export default memo(NewArrivalBanner);
