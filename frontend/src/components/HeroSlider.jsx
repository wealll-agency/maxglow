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
  const [images, setImages] = useState(DEFAULT_IMAGES);

  // Hero images are now hardcoded as requested to prevent any automatic changes
  // useEffect(() => {
  //   const fetchHero = async () => { ... }
  // }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleBannerClick = () => {
    router.push(BANNER_DESTINATION);
  };

  return (
    <section 
      className="hero-banner-section" 
      onClick={handleBannerClick}
      style={{
        width: '100%',
        position: 'relative',
        cursor: 'pointer',
        display: 'block',
        padding: '10px 20px', // Small padding so the rounded corners are visible against the background
        backgroundColor: '#fff'
      }}
    >
      <style>
        {`
          .shop-now-animated {
            animation: pulse-glow 2s infinite;
          }
          @keyframes pulse-glow {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          }
        `}
      </style>
      <div 
        className="carousel-mask"
        style={{
          borderRadius: '20px', 
          overflow: 'hidden', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          position: 'relative',
          width: '100%'
        }}
      >
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
              flexShrink: 0,
              position: 'relative',
              aspectRatio: '2.5 / 1', // Industry standard wide panoramic ratio
              minHeight: '350px' // Hardcoded minimum height to prevent squishing on mobile
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
              <button 
                className="shop-now-animated"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#111',
                  border: 'none',
                  padding: '12px 30px',
                  fontSize: '18px',
                  fontWeight: '700',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                Shop Now
                <span style={{ fontSize: '20px' }}>&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 10
      }}>
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
            style={{
              width: currentIndex === idx ? '35px' : '12px',
              height: '12px',
              borderRadius: '6px',
              backgroundColor: currentIndex === idx ? '#3BAE56' : 'rgba(255,255,255,0.8)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* CLOSE CAROUSEL MASK */}
      </div>
    </section>
  );
}
