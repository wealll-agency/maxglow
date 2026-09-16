"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image, { getImageProps } from 'next/image';
import api from '../utils/axiosConfig';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { fetchSystemSettings } from '../utils/settingsCache';
import { getImageUrl } from '../utils/imageConfig';

const BANNER_DESTINATION = '/shop';
const DEFAULT_IMAGES = ['/hero_final_1.png', '/hero_final_2.png', '/hero_final_3.png'];
const SLIDE_INTERVAL = 4000;

export default function HeroSlider({ initialImages = [], initialMobileImages = [] }) {
  const router = useRouter();
  const [images, setImages] = useState(
    Array.isArray(initialImages) && initialImages.length > 0 ? initialImages : DEFAULT_IMAGES
  );
  const [mobileImages, setMobileImages] = useState(
    Array.isArray(initialMobileImages) ? initialMobileImages : []
  );

  useEffect(() => {
    // If initialImages were already supplied by SSR, no need to immediately re-fetch unless empty
    if (initialImages && initialImages.length > 0) return;

    const fetchHero = async () => {
      try {
        const res = await fetchSystemSettings();
        if (res.success && res.settings?.media_hero?.length > 0) {
          const validImages = res.settings.media_hero.map(img => img.trim() !== '' ? img : '');
          const validMobileImages = (res.settings.media_hero_mobile || []).map(img => img.trim() !== '' ? img : '');
          
          if (validImages.some(img => img !== '')) {
            setImages(validImages);
            setMobileImages(validMobileImages);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load hero images', err);
      }
      setImages(DEFAULT_IMAGES);
      setMobileImages([]);
    };
    fetchHero();
  }, [initialImages]);

  const handleBannerClick = () => {
    router.push(BANNER_DESTINATION);
  };

  if (images.length === 0) {
    return (
      <section
        className="hero-banner-section"
        style={{
          width: '100%',
          position: 'relative',
          padding: '10px 20px', 
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .hero-banner-section {
            margin-bottom: 0px;
          }
          @media (max-width: 991px) {
            .hero-banner-section { margin-bottom: 0px !important; padding-bottom: 0px !important; }
            .carousel-mask { min-height: unset; aspect-ratio: 1080/1080 !important; }
          }
        ` }} />
        <div
          className="carousel-mask"
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'none',
            position: 'relative',
            width: '100%',
            aspectRatio: '1920/800',
            backgroundColor: '#e5e7eb',
          }}
        />
      </section>
    );
  }

  return (
    <section
      className="hero-banner-section"
      onClick={handleBannerClick}
      style={{
        width: '100%',
        position: 'relative',
        cursor: 'pointer',
        display: 'block',
        padding: '10px 20px', 
        backgroundColor: '#fff',
        overflow: 'hidden'
      }}
    >
      <div
        className="carousel-mask"
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'none',
          position: 'relative',
          width: '100%',
          aspectRatio: '1920/800',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .hero-banner-section {
            margin-bottom: 0px;
          }
          @media (max-width: 991px) {
            .hero-banner-section { margin-bottom: 0px !important; padding-bottom: 0px !important; }
            .carousel-mask { min-height: unset; aspect-ratio: 1080/1080 !important; }
          }
          /* Ensure images do not bleed out or cause collapse */
          .hero-slider-track { height: 100%; }
          .slider-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 10;
            background: rgba(255, 255, 255, 0.75) !important;
            border: none !important;
            border-radius: 50% !important;
            width: 44px !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          }
          .slider-nav-btn:hover {
            background: rgba(255, 255, 255, 0.95) !important;
            transform: translateY(-50%) scale(1.1) !important;
          }
          .slider-nav-prev { left: 20px !important; }
          .slider-nav-next { right: 20px !important; }
          @media (max-width: 768px) {
            .slider-nav-btn {
              display: none !important;
            }
          }
        ` }} />
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Swiper
            modules={[Autoplay, Navigation]}
            slidesPerView={1}
            loop={images.length > 1}
            autoplay={{ delay: SLIDE_INTERVAL, disableOnInteraction: false }}
            navigation={{
              prevEl: '.slider-nav-prev',
              nextEl: '.slider-nav-next',
            }}
            speed={800}
            style={{ width: '100%', height: '100%' }}
          >
            {images.map((img, idx) => {
              const hasCustomMobile = Boolean(mobileImages[idx] && mobileImages[idx].trim() !== '');
              return (
                <SwiperSlide key={idx} style={{ height: 'auto' }}>
                  <div style={{
                    flex: '0 0 100%', 
                    width: '100%',
                    maxWidth: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc' 
                  }}>
                    {hasCustomMobile ? (
                      (() => {
                        const common = { alt: `MaxGlow Premium Herbal Wellness ${idx + 1}`, sizes: '100vw' };
                        const {
                          props: { srcSet: desktopSrcSet, ...desktopRest },
                        } = getImageProps({
                          ...common,
                          src: getImageUrl(img),
                          width: 1920,
                          height: 800,
                          priority: idx === 0,
                          fetchPriority: idx === 0 ? "high" : "auto",
                          loading: idx === 0 ? "eager" : "lazy",
                        });
                        const {
                          props: { srcSet: mobileSrcSet, ...mobileRest },
                        } = getImageProps({
                          ...common,
                          src: getImageUrl(mobileImages[idx]),
                          width: 1080,
                          height: 1080,
                          priority: idx === 0,
                          fetchPriority: idx === 0 ? "high" : "auto",
                          loading: idx === 0 ? "eager" : "lazy",
                        });

                        return (
                          <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                            <source media="(max-width: 991px)" srcSet={mobileSrcSet} />
                            <source media="(min-width: 992px)" srcSet={desktopSrcSet} />
                            <img
                              {...desktopRest}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                margin: '0 auto',
                              }}
                            />
                          </picture>
                        );
                      })()
                    ) : (
                      img && (
                        <Image
                          src={getImageUrl(img)}
                          alt={`MaxGlow Premium Herbal Wellness ${idx + 1}`}
                          width={1920}
                          height={800}
                          priority={idx === 0}
                          fetchPriority={idx === 0 ? "high" : "auto"}
                          loading={idx === 0 ? "eager" : "lazy"}
                          sizes="100vw"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            margin: '0 auto'
                          }}
                        />
                      )
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Left Nav Button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="slider-nav-btn slider-nav-prev"
        >
          <span>&larr;</span>
        </button>

        {/* Right Nav Button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="slider-nav-btn slider-nav-next"
        >
          <span>&rarr;</span>
        </button>


        {/* CLOSE CAROUSEL MASK */}
      </div>
    </section>
  );
}
