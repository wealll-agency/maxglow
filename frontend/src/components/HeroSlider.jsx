"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../utils/axiosConfig';

const BANNER_DESTINATION = '/shop';
const DEFAULT_IMAGES = ['/hero_final_1.png', '/hero_final_2.png', '/hero_final_3.png'];
const SLIDE_INTERVAL = 4000;

export default function HeroSlider() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState([]); // Initialize empty to prevent cache flashing

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
      setImages(DEFAULT_IMAGES); // Fallback only if no dynamic images exist
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

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
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
            .carousel-mask { min-height: unset; aspect-ratio: auto !important; }
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
            aspectRatio: '1920/600',
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
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          position: 'relative',
          width: '100%',
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .hero-banner-section {
            margin-bottom: 0px;
          }
          @media (max-width: 991px) {
            .hero-banner-section { margin-bottom: 0px !important; padding-bottom: 0px !important; }
            .carousel-mask { min-height: unset; aspect-ratio: auto !important; }
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
              width: 32px !important;
              height: 32px !important;
            }
            .slider-nav-prev { left: 10px !important; }
            .slider-nav-next { right: 10px !important; }
            .slider-nav-btn span { font-size: 14px !important; }
          }
        ` }} />
        <div
          className="hero-slider-track"
          style={{
            display: 'flex',
            flexWrap: 'nowrap', /* Industry standard for sliders */
            alignItems: 'center', 
            width: '100%',
            height: '100%',
            transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)', 
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} style={{
              flex: '0 0 100%', /* Industry standard exact sizing */
              width: '100%',
              maxWidth: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8fafc' 
            }}>
              <Image
                src={img}
                alt={`MaxGlow Premium Herbal Wellness ${idx + 1}`}
                width={1920}
                height={600}
                priority={idx === 0}
                sizes="100vw"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
              {/* Removed Animated Shop Now Button as per request */}
            </div>
          ))}
        </div>

        {/* Left Nav Button */}
        <button
          onClick={handlePrev}
          className="slider-nav-btn slider-nav-prev"
        >
          <span>&larr;</span>
        </button>

        {/* Right Nav Button */}
        <button
          onClick={handleNext}
          className="slider-nav-btn slider-nav-next"
        >
          <span>&rarr;</span>
        </button>


        {/* CLOSE CAROUSEL MASK */}
      </div>
    </section>
  );
}
