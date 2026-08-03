"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/axiosConfig';

const BANNER_DESTINATION = '/shop';
const DEFAULT_IMAGES = ['/hero_final_1.png', '/hero_final_2.png', '/hero_final_3.png'];
const SLIDE_INTERVAL = 4000;

export default function HeroSlider() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.media_hero?.length > 0) {
          const validImages = res.data.settings.media_hero.filter(img => img.trim() !== '');
          if (validImages.length > 0) {
            setImages(validImages);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load hero images', err);
      }
      setImages(DEFAULT_IMAGES);
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

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
            margin-bottom: 20px;
          }
          .carousel-mask { min-height: 350px; }
          @media (max-width: 991px) {
            .hero-banner-section { margin-bottom: 0px !important; padding-bottom: 0px !important; }
            .carousel-mask { min-height: unset; aspect-ratio: 2.4/1 !important; }
          }
        ` }} />
        <div
          className="carousel-mask"
          style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            position: 'relative',
            width: '100%',
            aspectRatio: '2.4 / 1',
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
      <style dangerouslySetInnerHTML={{ __html: `
        .shop-now-animated {
          animation: pulse-glow 2s infinite;
          background: rgba(255, 255, 255, 0.9);
          color: #111;
          border: none;
          padding: 12px 30px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .shop-now-animated .arrow-icon {
          font-size: 20px;
        }
        @media (max-width: 768px) {
          .shop-now-animated {
            padding: 8px 16px !important;
            font-size: 11px !important;
            letter-spacing: 0.5px !important;
            gap: 4px !important;
          }
          .shop-now-animated .arrow-icon {
            font-size: 14px !important;
          }
        }
        @keyframes pulse-glow {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      ` }} />
      <div
        className="carousel-mask"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          position: 'relative',
          width: '100%',
          aspectRatio: '2.4 / 1', // 1920x800 Aspect Ratio
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .hero-banner-section {
            margin-bottom: 20px;
          }
          .carousel-mask { min-height: 350px; }
          @media (max-width: 991px) {
            .hero-banner-section { margin-bottom: 0px !important; padding-bottom: 0px !important; }
            .carousel-mask { min-height: unset; aspect-ratio: 2.4/1 !important; }
          }
          /* Ensure images do not bleed out or cause collapse */
          .hero-slider-track { height: 100%; min-height: 100%; }
        ` }} />
        <div
          className="hero-slider-track"
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            transition: 'transform 1.2s cubic-bezier(0.77, 0, 0.175, 1)',
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} style={{
              minWidth: '100%',
              height: '100%',
              flexShrink: 0,
              position: 'relative',
            }}>
              <img
                src={img}
                alt={`MaxGlow Premium Herbal Wellness ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // ensure it perfectly fills the panoramic shape
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
              {/* Animated Shop Now Button in Bottom Left */}
              <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '8%',
                zIndex: 5
              }}>
                <button className="shop-now-animated">
                  Shop Now
                  <span className="arrow-icon">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>


        {/* CLOSE CAROUSEL MASK */}
      </div>
    </section>
  );
}
